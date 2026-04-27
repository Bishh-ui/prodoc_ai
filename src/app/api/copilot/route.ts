import { NextRequest, NextResponse } from "next/server";
import { patients } from "@/lib/data";

// Simulated AI copilot — replace with real OpenAI/Groq call in production
export async function POST(req: NextRequest) {
  const { patientId, question } = await req.json();

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  // Build context-aware response
  const responses: Record<string, string> = {
    summary: patient.aiSummary,
    risk: `Risk Score: ${patient.riskScore}/100 (${patient.riskLevel.toUpperCase()}). ${patient.alerts.join(". ")}.`,
    medications: `Current medications: ${patient.medications.join(", ")}.`,
    vitals: `BP: ${patient.vitals.bp} | HR: ${patient.vitals.hr}bpm | Temp: ${patient.vitals.temp}°C | SpO2: ${patient.vitals.spo2}%`,
    default: `Based on ${patient.name}'s history: ${patient.aiSummary} Trend: ${patient.trend}.`,
  };

  const q = question?.toLowerCase() ?? "";
  let answer = responses.default;
  if (q.includes("summar")) answer = responses.summary;
  else if (q.includes("risk") || q.includes("danger")) answer = responses.risk;
  else if (q.includes("med") || q.includes("drug")) answer = responses.medications;
  else if (q.includes("vital") || q.includes("bp") || q.includes("heart")) answer = responses.vitals;

  // Simulate streaming delay
  await new Promise((r) => setTimeout(r, 600));

  return NextResponse.json({
    answer,
    patient: patient.name,
    riskLevel: patient.riskLevel,
    riskScore: patient.riskScore,
    suggestedActions: patient.alerts.map((a) => `Address: ${a}`),
  });
}
