import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getPatient, getChatHistory, saveChatMessage } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Prodoc Neural Copilot, an advanced AI clinical assistant embedded in a hospital management platform. You assist doctors by analyzing patient data and providing evidence-based clinical insights.

BEHAVIOR RULES:
- Respond concisely and clinically — like a senior physician colleague, not a chatbot
- Always ground your answers in the patient data provided
- Flag critical findings with [ALERT] prefix
- Suggest actionable next steps when relevant
- Never fabricate lab values or clinical data not present in the context
- Use medical terminology appropriately but explain when needed
- Format responses clearly — use short paragraphs, not bullet walls

RESPONSE STYLE:
- Direct and confident
- Evidence-based
- Clinically precise
- Maximum 150 words unless a full summary is requested`;

function buildPatientContext(p: Awaited<ReturnType<typeof getPatient>>) {
  if (!p) return "";
  return `
PATIENT RECORD:
- Name: ${p.name} | Age: ${p.age} | ID: ${p.id}
- Primary Condition: ${p.condition}
- Risk Level: ${p.riskLevel.toUpperCase()} (Score: ${p.riskScore}/100)
- Trend: ${p.trend}
- Last Visit: ${p.lastVisit} | Next Appointment: ${p.nextAppointment ?? "NOT SCHEDULED"}
- Missed Appointments: ${p.missedAppointments}

CURRENT VITALS:
- BP: ${p.vitals.bp} mmHg | HR: ${p.vitals.hr} bpm | Temp: ${p.vitals.temp}°C | SpO2: ${p.vitals.spo2}%

MEDICATIONS: ${p.medications.join(", ")}

ACTIVE ALERTS: ${p.alerts.length > 0 ? p.alerts.join("; ") : "None"}

CLINICAL SUMMARY: ${p.aiSummary}
`.trim();
}

// Increase timeout for Groq API calls
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { patientId, question } = await req.json();

    if (!patientId || !question) {
      return NextResponse.json({ error: "Missing patientId or question" }, { status: 400 });
    }

    // Fetch patient from DB (with fallback to static data)
    let patient;
    try {
      patient = await getPatient(patientId);
    } catch (dbErr) {
      console.warn("DB fetch failed, using static data:", dbErr);
      const { patients } = await import("@/lib/data");
      patient = patients.find((p) => p.id === patientId) ?? null;
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch chat history (with fallback)
    let history: { role: string; content: string }[] = [];
    try {
      history = await getChatHistory(patientId);
    } catch {
      history = [];
    }

    // Build messages array
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n${buildPatientContext(patient)}`,
      },
      ...history.slice(-10).map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: question },
    ];

    // Call Groq with timeout
    const completion = await Promise.race([
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.3,
        max_tokens: 400,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Groq API timeout")), 25000)
      ),
    ]);

    const answer = completion.choices[0]?.message?.content ?? "No response generated.";

    // Persist to DB (non-blocking)
    try {
      await saveChatMessage(patientId, "user", question);
      await saveChatMessage(patientId, "assistant", answer);
    } catch {
      console.warn("Failed to save chat history");
    }

    const suggestedActions = patient.alerts.slice(0, 3).map((a) => `Review: ${a}`);

    return NextResponse.json({
      answer,
      patient: patient.name,
      riskLevel: patient.riskLevel,
      riskScore: patient.riskScore,
      suggestedActions,
      model: "llama-3.3-70b-versatile",
    });

  } catch (err: unknown) {
    console.error("Copilot error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: `Copilot error: ${message}` }, { status: 500 });
  }
}
