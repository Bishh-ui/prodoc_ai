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

export async function POST(req: NextRequest) {
  try {
    const { patientId, question } = await req.json();

    if (!patientId || !question) {
      return NextResponse.json({ error: "Missing patientId or question" }, { status: 400 });
    }

    // Fetch patient from DB
    const patient = await getPatient(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch last 10 messages for context continuity
    const history = await getChatHistory(patientId);

    // Build messages array
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n${buildPatientContext(patient)}`,
      },
      // Inject chat history for continuity
      ...history.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: question },
    ];

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,   // low temp = more clinical, less creative
      max_tokens: 400,
    });

    const answer = completion.choices[0]?.message?.content ?? "No response generated.";

    // Persist to DB
    await saveChatMessage(patientId, "user", question);
    await saveChatMessage(patientId, "assistant", answer);

    // Generate suggested actions based on patient alerts
    const suggestedActions = patient.alerts.map((a) => `Review: ${a}`);

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
