import { getSupabaseAdmin } from "./supabase";
import type { Patient, WorkflowTask } from "./data";

// ── Map DB row → app Patient type ─────────────────────────────────────────
function rowToPatient(r: Record<string, unknown>): Patient {
  return {
    id: r.id as string,
    name: r.name as string,
    age: r.age as number,
    condition: r.condition as string,
    lastVisit: r.last_visit as string,
    nextAppointment: (r.next_appointment as string) ?? null,
    riskLevel: r.risk_level as Patient["riskLevel"],
    riskScore: r.risk_score as number,
    missedAppointments: r.missed_appointments as number,
    medications: r.medications as string[],
    vitals: {
      bp: r.bp as string,
      hr: r.hr as number,
      temp: r.temp as number,
      spo2: r.spo2 as number,
    },
    aiSummary: r.ai_summary as string,
    alerts: r.alerts as string[],
    trend: r.trend as Patient["trend"],
  };
}

// ── Map DB row → app WorkflowTask type ────────────────────────────────────
function rowToTask(r: Record<string, unknown>): WorkflowTask {
  return {
    id: r.id as string,
    type: r.type as WorkflowTask["type"],
    patient: r.patient_name as string,
    priority: r.priority as WorkflowTask["priority"],
    description: r.description as string,
    aiGenerated: r.ai_generated as boolean,
    createdAt: r.created_at as string,
  };
}

// ── Patients ───────────────────────────────────────────────────────────────
export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("patients")
    .select("*")
    .order("risk_score", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToPatient);
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToPatient(data);
}

export async function getTasks(): Promise<WorkflowTask[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("workflow_tasks")
    .select("*")
    .eq("completed", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToTask);
}

export async function completeTask(id: string): Promise<void> {
  await getSupabaseAdmin().from("workflow_tasks").update({ completed: true }).eq("id", id);
}

export async function getChatHistory(patientId: string) {
  const { data } = await getSupabaseAdmin()
    .from("chat_history")
    .select("role, content")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: true })
    .limit(20);
  return data ?? [];
}

export async function saveChatMessage(patientId: string, role: "user" | "assistant", content: string) {
  await getSupabaseAdmin().from("chat_history").insert({ patient_id: patientId, role, content });
}
