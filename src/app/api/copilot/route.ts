import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getPatient, getChatHistory, saveChatMessage } from "@/lib/db";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are Prodoc Neural Copilot, an AI clinical assistant embedded in a hospital management platform. You assist doctors by analyzing patient data.

STRICT RULES:
- ONLY answer questions directly related to the current patient's clinical situation
- If asked anything unrelated to this patient (general science, biology, other topics), respond exactly: "I can only assist with clinical questions about this patient."
- Ground every answer in the patient data provided
- Flag critical findings by starting with ALERT:
- Keep responses under 120 words unless a full summary is requested
- Be direct and clinical — like a senior physician colleague
- Do NOT use special symbols like diamond shapes in your text responses`;

function buildContext(p: NonNullable<Awaited<ReturnType<typeof getPatient>>>) {
  return `PATIENT: ${p.name} | Age: ${p.age} | ${p.condition}
RISK: ${p.riskLevel.toUpperCase()} (${p.riskScore}/100) | Trend: ${p.trend}
VISITS: Last ${p.lastVisit} | Next: ${p.nextAppointment ?? "NOT SCHEDULED"} | Missed: ${p.missedAppointments}
VITALS: BP ${p.vitals.bp} | HR ${p.vitals.hr}bpm | Temp ${p.vitals.temp}°C | SpO2 ${p.vitals.spo2}%
MEDS: ${p.medications.join(", ")}
ALERTS: ${p.alerts.length ? p.alerts.join("; ") : "None"}
SUMMARY: ${p.aiSummary}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.patientId || !body?.question) {
      return NextResponse.json({ error: "Missing patientId or question" }, { status: 400 });
    }
    const { patientId, question } = body;

    // Get patient — try DB first, fall back to static
    let patient: Awaited<ReturnType<typeof getPatient>> = null;
    try { patient = await getPatient(patientId); } catch { /* ignore */ }
    if (!patient) {
      try {
        const { patients } = await import("@/lib/data");
        patient = patients.find((p) => p.id === patientId) ?? null;
      } catch { /* ignore */ }
    }
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // Get history — fail silently
    let history: { role: string; content: string }[] = [];
    try { history = await getChatHistory(patientId); } catch { /* ignore */ }

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${buildContext(patient)}` },
      ...history.slice(-8).map((h) => ({
        role: (h.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: question },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      max_tokens: 350,
    });

    const answer = completion.choices[0]?.message?.content?.trim() ?? "No response generated.";

    // Save history fire-and-forget
    Promise.all([
      saveChatMessage(patientId, "user", question),
      saveChatMessage(patientId, "assistant", answer),
    ]).catch(() => { /* ignore */ });

    return NextResponse.json({
      answer,
      suggestedActions: (patient.alerts ?? []).slice(0, 3).map((a) => `Review: ${a}`),
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[copilot]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
