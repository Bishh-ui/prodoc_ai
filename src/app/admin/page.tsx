"use client";
import { useState, useEffect } from "react";
import { Patient } from "@/lib/data";
import { Background } from "@/components/ui/Background";
import { RiskBadge } from "@/components/ui/RiskBadge";

// ── Login Screen ───────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) { onLogin(); }
    else { setError("Invalid password"); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <Background />
      <div style={{ position: "relative", zIndex: 5, width: 380 }}>
        <div style={{ background: "rgba(5,13,31,0.95)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "40px 36px", boxShadow: "0 0 60px rgba(99,102,241,0.15)" }}>
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)" }} />
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "white", fontWeight: 900, margin: "0 auto 16px", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>P</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.04em" }}>Admin Access</h1>
            <p style={{ fontSize: 12, color: "#334155", marginTop: 6, letterSpacing: "0.06em" }}>PRODOC AI · RESTRICTED AREA</p>
          </div>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: "#475569", display: "block", marginBottom: 8, letterSpacing: "0.12em" }}>ADMIN PASSWORD</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                style={{ width: "100%", background: "rgba(15,23,42,0.8)", border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.2)"}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
              />
              {error && <p style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>{error}</p>}
            </div>
            <button type="submit" disabled={loading || !pw} style={{ width: "100%", background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 12, padding: "13px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: loading || !pw ? 0.5 : 1, letterSpacing: "0.06em", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
              {loading ? "Verifying..." : "Access Admin Panel"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#1e293b" }}>
            <a href="/" style={{ color: "#334155", textDecoration: "none" }}>← Back to Dashboard</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Patient Form ───────────────────────────────────────────────────────────
const emptyForm = {
  id: "", name: "", age: 0, condition: "",
  lastVisit: new Date().toISOString().split("T")[0],
  nextAppointment: "", riskLevel: "medium" as Patient["riskLevel"],
  riskScore: 50, missedAppointments: 0, medications: "",
  bp: "120/80", hr: 72, temp: 36.6, spo2: 98,
  aiSummary: "", alerts: "", trend: "stable" as Patient["trend"],
};

// ── Admin Panel ────────────────────────────────────────────────────────────
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => { loadPatients(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadPatients() {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data.patients ?? []);
    } catch { showToast("Failed to load patients"); }
    finally { setLoading(false); }
  }

  function openNew() {
    const nextNum = patients.length + 1;
    setForm({ ...emptyForm, id: `P${String(nextNum).padStart(3, "0")}` });
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(p: Patient) {
    setForm({
      id: p.id, name: p.name, age: p.age, condition: p.condition,
      lastVisit: p.lastVisit, nextAppointment: p.nextAppointment ?? "",
      riskLevel: p.riskLevel, riskScore: p.riskScore,
      missedAppointments: p.missedAppointments,
      medications: p.medications.join(", "),
      bp: p.vitals.bp, hr: p.vitals.hr, temp: p.vitals.temp, spo2: p.vitals.spo2,
      aiSummary: p.aiSummary,
      alerts: p.alerts.join(", "),
      trend: p.trend,
    });
    setEditingId(p.id);
    setFormError("");
    setShowForm(true);
  }

  function validate() {
    if (!form.id.trim()) return "Patient ID is required";
    if (!form.name.trim()) return "Name is required";
    if (!form.age || form.age < 1) return "Valid age is required";
    if (!form.condition.trim()) return "Condition is required";
    if (form.riskScore < 0 || form.riskScore > 100) return "Risk score must be 0-100";
    return "";
  }

  async function save() {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true);
    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      age: Number(form.age),
      condition: form.condition.trim(),
      lastVisit: form.lastVisit,
      nextAppointment: form.nextAppointment || null,
      riskLevel: form.riskLevel,
      riskScore: Number(form.riskScore),
      missedAppointments: Number(form.missedAppointments),
      medications: form.medications.split(",").map((m) => m.trim()).filter(Boolean),
      vitals: { bp: form.bp, hr: Number(form.hr), temp: Number(form.temp), spo2: Number(form.spo2) },
      aiSummary: form.aiSummary.trim(),
      alerts: form.alerts.split(",").map((a) => a.trim()).filter(Boolean),
      trend: form.trend,
    };
    try {
      const res = await fetch("/api/patients", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showToast(editingId ? "Patient updated" : "Patient added");
      setShowForm(false);
      loadPatients();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function deletePatient(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/patients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Patient deleted");
      loadPatients();
    } catch { showToast("Failed to delete patient"); }
  }

  async function logout() {
    await fetch("/api/admin-auth", { method: "DELETE" });
    onLogout();
  }

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label style={{ fontSize: 10, color: "#475569", display: "block", marginBottom: 6, letterSpacing: "0.1em" }}>{label}</label>
      {children}
    </div>
  );

  const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box" };
  const selectStyle: React.CSSProperties = { ...inputStyle };

  return (
    <div style={{ minHeight: "100vh", background: "#020817", position: "relative" }}>
      <Background />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
          ✓ {toast}
        </div>
      )}

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
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/" style={{ fontSize: 11, color: "#475569", textDecoration: "none", padding: "7px 14px", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10 }}>Dashboard</a>
          <button onClick={logout} style={{ fontSize: 11, color: "#f87171", padding: "7px 14px", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, background: "rgba(239,68,68,0.06)", cursor: "pointer" }}>Logout</button>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 5, padding: "28px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0" }}>Patient Registry</h1>
            <p style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>{patients.length} patients in database</p>
          </div>
          <button onClick={openNew} style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 12, padding: "11px 22px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 20px rgba(99,102,241,0.3)", letterSpacing: "0.05em" }}>
            + Add Patient
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155", fontSize: 13 }}>Loading patients...</div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155", fontSize: 13 }}>No patients found. Add one to get started.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {patients.map((p) => (
              <div key={p.id} style={{ background: "rgba(5,13,31,0.88)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", flexShrink: 0 }}>{p.name[0]}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{p.name}</p>
                      <span style={{ fontSize: 10, color: "#334155" }}>({p.id})</span>
                      <RiskBadge level={p.riskLevel} />
                    </div>
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{p.age}y · {p.condition} · Risk: {p.riskScore}/100 · {p.trend}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(p)} style={{ padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#818cf8", fontSize: 12, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => deletePatient(p.id, p.name)} style={{ padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#f87171", fontSize: 12, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(2,8,23,0.75)", backdropFilter: "blur(4px)", zIndex: 40 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 50, width: "min(680px, 92vw)", maxHeight: "88vh", overflowY: "auto", background: "rgba(5,13,31,0.98)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "28px 30px", boxShadow: "0 0 60px rgba(99,102,241,0.2)" }}>
            <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 22 }}>{editingId ? "Edit Patient" : "Add New Patient"}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <F label="PATIENT ID"><input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!!editingId} style={{ ...inputStyle, opacity: editingId ? 0.5 : 1 }} /></F>
              <F label="FULL NAME"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></F>
              <F label="AGE"><input type="number" value={form.age || ""} onChange={(e) => setForm({ ...form, age: +e.target.value })} style={inputStyle} /></F>
              <F label="CONDITION"><input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={inputStyle} /></F>
              <F label="LAST VISIT"><input type="date" value={form.lastVisit} onChange={(e) => setForm({ ...form, lastVisit: e.target.value })} style={inputStyle} /></F>
              <F label="NEXT APPOINTMENT"><input type="date" value={form.nextAppointment} onChange={(e) => setForm({ ...form, nextAppointment: e.target.value })} style={inputStyle} /></F>
              <F label="RISK LEVEL">
                <select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value as Patient["riskLevel"] })} style={selectStyle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </F>
              <F label="RISK SCORE (0-100)"><input type="number" min={0} max={100} value={form.riskScore} onChange={(e) => setForm({ ...form, riskScore: +e.target.value })} style={inputStyle} /></F>
              <F label="TREND">
                <select value={form.trend} onChange={(e) => setForm({ ...form, trend: e.target.value as Patient["trend"] })} style={selectStyle}>
                  <option value="improving">Improving</option>
                  <option value="stable">Stable</option>
                  <option value="declining">Declining</option>
                </select>
              </F>
              <F label="MISSED APPOINTMENTS"><input type="number" min={0} value={form.missedAppointments} onChange={(e) => setForm({ ...form, missedAppointments: +e.target.value })} style={inputStyle} /></F>
            </div>

            <div style={{ marginTop: 14 }}>
              <F label="MEDICATIONS (comma separated)"><input value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} placeholder="Drug 500mg, Drug2 10mg" style={inputStyle} /></F>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 14 }}>
              <F label="BP"><input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" style={inputStyle} /></F>
              <F label="HR (bpm)"><input type="number" value={form.hr} onChange={(e) => setForm({ ...form, hr: +e.target.value })} style={inputStyle} /></F>
              <F label="TEMP (°C)"><input type="number" step="0.1" value={form.temp} onChange={(e) => setForm({ ...form, temp: +e.target.value })} style={inputStyle} /></F>
              <F label="SpO2 (%)"><input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: +e.target.value })} style={inputStyle} /></F>
            </div>

            <div style={{ marginTop: 14 }}>
              <F label="AI CLINICAL SUMMARY">
                <textarea value={form.aiSummary} onChange={(e) => setForm({ ...form, aiSummary: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </F>
            </div>
            <div style={{ marginTop: 14 }}>
              <F label="ALERTS (comma separated)"><input value={form.alerts} onChange={(e) => setForm({ ...form, alerts: e.target.value })} placeholder="Alert 1, Alert 2" style={inputStyle} /></F>
            </div>

            {formError && <p style={{ fontSize: 12, color: "#f87171", marginTop: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>⚠ {formError}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 12, padding: "12px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
                {saving ? "Saving..." : editingId ? "Update Patient" : "Add Patient"}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: "12px 22px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)", color: "#818cf8", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Root — auth gate ───────────────────────────────────────────────────────
export default function AdminRoot() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if already authenticated via cookie
    fetch("/api/admin-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "__check__" }) })
      .then(() => setAuthed(false))
      .catch(() => setAuthed(false));
    // Simple check: try a protected endpoint
    fetch("/api/patients").then((r) => {
      setAuthed(r.ok ? false : false); // always start at login
    });
    setAuthed(false);
  }, []);

  if (authed === null) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <AdminPanel onLogout={() => setAuthed(false)} />;
}
