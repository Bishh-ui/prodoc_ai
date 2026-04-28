"use client";
import { useState, useEffect } from "react";
import { Patient } from "@/lib/data";
import { Background } from "@/components/ui/Background";
import { RiskBadge } from "@/components/ui/RiskBadge";

export default function AdminPanel() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    age: 0,
    condition: "",
    lastVisit: "",
    nextAppointment: "",
    riskLevel: "medium" as Patient["riskLevel"],
    riskScore: 50,
    missedAppointments: 0,
    medications: "",
    bp: "120/80",
    hr: 72,
    temp: 36.6,
    spo2: 98,
    aiSummary: "",
    alerts: "",
    trend: "stable" as Patient["trend"],
  });

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    const res = await fetch("/api/patients");
    const data = await res.json();
    setPatients(data.patients ?? []);
    setLoading(false);
  }

  function openNew() {
    const nextId = `P${String(patients.length + 1).padStart(3, "0")}`;
    setForm({
      id: nextId,
      name: "",
      age: 0,
      condition: "",
      lastVisit: new Date().toISOString().split("T")[0],
      nextAppointment: "",
      riskLevel: "medium",
      riskScore: 50,
      missedAppointments: 0,
      medications: "",
      bp: "120/80",
      hr: 72,
      temp: 36.6,
      spo2: 98,
      aiSummary: "",
      alerts: "",
      trend: "stable",
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(p: Patient) {
    setForm({
      id: p.id,
      name: p.name,
      age: p.age,
      condition: p.condition,
      lastVisit: p.lastVisit,
      nextAppointment: p.nextAppointment ?? "",
      riskLevel: p.riskLevel,
      riskScore: p.riskScore,
      missedAppointments: p.missedAppointments,
      medications: p.medications.join(", "),
      bp: p.vitals.bp,
      hr: p.vitals.hr,
      temp: p.vitals.temp,
      spo2: p.vitals.spo2,
      aiSummary: p.aiSummary,
      alerts: p.alerts.join(", "),
      trend: p.trend,
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      id: form.id,
      name: form.name,
      age: form.age,
      condition: form.condition,
      lastVisit: form.lastVisit,
      nextAppointment: form.nextAppointment || null,
      riskLevel: form.riskLevel,
      riskScore: form.riskScore,
      missedAppointments: form.missedAppointments,
      medications: form.medications.split(",").map((m) => m.trim()).filter(Boolean),
      vitals: { bp: form.bp, hr: form.hr, temp: form.temp, spo2: form.spo2 },
      aiSummary: form.aiSummary,
      alerts: form.alerts.split(",").map((a) => a.trim()).filter(Boolean),
      trend: form.trend,
    };

    const method = editingId ? "PATCH" : "POST";
    await fetch("/api/patients", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    setShowForm(false);
    loadPatients();
  }

  async function deletePatient(id: string) {
    if (!confirm("Delete this patient?")) return;
    await fetch("/api/patients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadPatients();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020817", position: "relative" }}>
      <Background />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, background: "rgba(2,8,23,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,102,241,0.12)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white", fontWeight: 900 }}>P</div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.06em" }}>PRODOC</span>
              <span className="shimmer-text" style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.06em" }}>AI</span>
            </div>
            <p style={{ fontSize: 8, color: "#1e293b", letterSpacing: "0.18em" }}>ADMIN PANEL</p>
          </div>
        </div>
        <a href="/" style={{ fontSize: 11, color: "#818cf8", textDecoration: "none", padding: "8px 16px", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10 }}>← Back to Dashboard</a>
      </nav>

      {/* Main */}
      <main style={{ position: "relative", zIndex: 5, padding: "28px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.02em" }}>Patient Management</h1>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{patients.length} patients in database</p>
          </div>
          <button onClick={openNew} style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 12, padding: "12px 24px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 20px rgba(99,102,241,0.3)", letterSpacing: "0.05em" }}>
            + Add Patient
          </button>
        </div>

        {/* Patient list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>Loading...</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {patients.map((p) => (
              <div key={p.id} style={{ background: "rgba(5,13,31,0.88)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white" }}>{p.name[0]}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{p.name}</p>
                      <span style={{ fontSize: 11, color: "#475569" }}>({p.id})</span>
                      <RiskBadge level={p.riskLevel} />
                    </div>
                    <p style={{ fontSize: 13, color: "#475569" }}>{p.age}y · {p.condition} · Risk: {p.riskScore}/100</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEdit(p)} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#818cf8", fontSize: 12, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => deletePatient(p.id)} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 12, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Form modal */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(2,8,23,0.8)", backdropFilter: "blur(4px)", zIndex: 40 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 50, width: "min(700px, 90vw)", maxHeight: "90vh", overflowY: "auto", background: "rgba(5,13,31,0.98)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "28px 32px", boxShadow: "0 0 60px rgba(99,102,241,0.2)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", marginBottom: 20 }}>{editingId ? "Edit Patient" : "Add New Patient"}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>PATIENT ID</label>
                <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!!editingId} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>NAME</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>AGE</label>
                <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: +e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>CONDITION</label>
                <input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>LAST VISIT</label>
                <input type="date" value={form.lastVisit} onChange={(e) => setForm({ ...form, lastVisit: e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>NEXT APPOINTMENT</label>
                <input type="date" value={form.nextAppointment} onChange={(e) => setForm({ ...form, nextAppointment: e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>RISK LEVEL</label>
                <select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value as Patient["riskLevel"] })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>RISK SCORE (0-100)</label>
                <input type="number" value={form.riskScore} onChange={(e) => setForm({ ...form, riskScore: +e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>TREND</label>
                <select value={form.trend} onChange={(e) => setForm({ ...form, trend: e.target.value as Patient["trend"] })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }}>
                  <option value="improving">Improving</option>
                  <option value="stable">Stable</option>
                  <option value="declining">Declining</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>MISSED APPOINTMENTS</label>
                <input type="number" value={form.missedAppointments} onChange={(e) => setForm({ ...form, missedAppointments: +e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>MEDICATIONS (comma separated)</label>
              <input value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} placeholder="Drug 500mg, Drug2 10mg" style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>BP</label>
                <input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>HR (bpm)</label>
                <input type="number" value={form.hr} onChange={(e) => setForm({ ...form, hr: +e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>TEMP (°C)</label>
                <input type="number" step="0.1" value={form.temp} onChange={(e) => setForm({ ...form, temp: +e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>SpO2 (%)</label>
                <input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: +e.target.value })} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>AI SUMMARY</label>
              <textarea value={form.aiSummary} onChange={(e) => setForm({ ...form, aiSummary: e.target.value })} rows={3} style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none", resize: "vertical" }} />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.08em" }}>ALERTS (comma separated)</label>
              <input value={form.alerts} onChange={(e) => setForm({ ...form, alerts: e.target.value })} placeholder="Alert 1, Alert 2" style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none" }} />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 12, padding: "12px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
                {saving ? "Saving..." : "Save Patient"}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#818cf8", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
