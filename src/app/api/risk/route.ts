import { NextResponse } from "next/server";
import { patients } from "@/lib/data";

export async function GET() {
  const riskReport = patients
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((p) => ({
      id: p.id,
      name: p.name,
      riskScore: p.riskScore,
      riskLevel: p.riskLevel,
      alerts: p.alerts,
      trend: p.trend,
      missedAppointments: p.missedAppointments,
    }));

  const criticalCount = patients.filter((p) => p.riskLevel === "critical").length;
  const avgRisk = Math.round(patients.reduce((s, p) => s + p.riskScore, 0) / patients.length);

  return NextResponse.json({ patients: riskReport, criticalCount, avgRisk, total: patients.length });
}
