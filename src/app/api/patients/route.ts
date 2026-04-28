import { NextRequest, NextResponse } from "next/server";
import { getPatients } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const patients = await getPatients();
    return NextResponse.json({ patients });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { error } = await supabaseAdmin.from("patients").insert({
      id: body.id,
      name: body.name,
      age: body.age,
      condition: body.condition,
      last_visit: body.lastVisit || null,
      next_appointment: body.nextAppointment || null,
      risk_level: body.riskLevel,
      risk_score: body.riskScore,
      missed_appointments: body.missedAppointments ?? 0,
      medications: body.medications ?? [],
      bp: body.vitals?.bp ?? "",
      hr: body.vitals?.hr ?? 0,
      temp: body.vitals?.temp ?? 36.6,
      spo2: body.vitals?.spo2 ?? 98,
      ai_summary: body.aiSummary ?? "",
      alerts: body.alerts ?? [],
      trend: body.trend,
    });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to add patient";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    const update: Record<string, unknown> = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.age !== undefined) update.age = fields.age;
    if (fields.condition !== undefined) update.condition = fields.condition;
    if (fields.lastVisit !== undefined) update.last_visit = fields.lastVisit;
    if (fields.nextAppointment !== undefined) update.next_appointment = fields.nextAppointment;
    if (fields.riskLevel !== undefined) update.risk_level = fields.riskLevel;
    if (fields.riskScore !== undefined) update.risk_score = fields.riskScore;
    if (fields.missedAppointments !== undefined) update.missed_appointments = fields.missedAppointments;
    if (fields.medications !== undefined) update.medications = fields.medications;
    if (fields.vitals) {
      if (fields.vitals.bp !== undefined) update.bp = fields.vitals.bp;
      if (fields.vitals.hr !== undefined) update.hr = fields.vitals.hr;
      if (fields.vitals.temp !== undefined) update.temp = fields.vitals.temp;
      if (fields.vitals.spo2 !== undefined) update.spo2 = fields.vitals.spo2;
    }
    if (fields.aiSummary !== undefined) update.ai_summary = fields.aiSummary;
    if (fields.alerts !== undefined) update.alerts = fields.alerts;
    if (fields.trend !== undefined) update.trend = fields.trend;
    update.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin.from("patients").update(update).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update patient";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const { error } = await supabaseAdmin.from("patients").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete patient";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
