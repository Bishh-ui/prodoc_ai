"use client";
import { useState, useEffect } from "react";
import { Patient } from "@/lib/data";
import { PatientCard } from "@/components/doctor/PatientCard";
import { CopilotChat } from "@/components/doctor/CopilotChat";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { WorkflowPanel } from "@/components/dashboard/WorkflowPanel";
import { StatCard } from "@/components/ui/StatCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Background } from "@/components/ui/Background";

type View = "dashboard" | "analytics" | "workflow";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>;
}

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  // Load patients from DB
  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((d) => {
        setPatients(d.patients ?? []);
        if (d.patients?.length > 0) setSelectedPatient(d.patients[0]);
      })
      .catch(() => {
        // Fallback to static data if DB not configured
        import("@/lib/data").then((m) => {
          setPatients(m.patients);
          setSelectedPatient(m.patients[0]);
        });
      })
      .finally(() => setLoadingPatients(false));
  }, []);

  const criticalCount = patients.filter((p) => p.riskLevel === "critical").length;
  const avgRisk = patients.length > 0
    ? Math.round(patients.reduce((s, p) => s + p.riskScore, 0) / patients.length)
    : 0;
  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingPatients) {
    return (
      <div style={{ minHeight: "100vh", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Background />
        <div style={{ textAlign: "center", position: "relative", zIndex: 5 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "white", margin: "0 auto 16px" }} className="ping-slow">◈</div>
          <p style={{ color: "#475569", fontSize: 13, letterSpacing: "0.1em" }}>INITIALIZING NEURAL PLATFORM...</p>
        </div>
      </div>
    );
  }

  if (!selectedPatient) return null;

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "analytics", label: "Analytics", icon: "◎" },
    { id: "workflow", label: "Workflow", icon: "⬡" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#020817", position: "relative" }}>
      <Background />

      {/* ── Navbar ── */}
      <nav style={{
        position: "relative", zIndex: 10,
        background: "rgba(2,8,23,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        padding: "0 28px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "white", fontWeight: 900,
            boxShadow: "0 0 20px rgba(99,102,241,0.45)",
            flexShrink: 0,
          }}>P</div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.06em" }}>PRODOC</span>
              <span className="shimmer-text" style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.06em" }}>AI</span>
            </div>
            <p style={{ fontSize: 8, color: "#1e293b", letterSpacing: "0.18em" }}>CLINICAL INTELLIGENCE PLATFORM</p>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                padding: "7px 16px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.06em", cursor: "pointer", border: "none",
                background: view === item.id ? "rgba(99,102,241,0.15)" : "transparent",
                color: view === item.id ? "#818cf8" : "#334155",
                borderBottom: view === item.id ? "2px solid #6366f1" : "2px solid transparent",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* System status dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[
              { label: "NEURAL", color: "#10b981" },
              { label: "RAG", color: "#06b6d4" },
              { label: "RISK", color: "#818cf8" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 5px ${s.color}`, display: "inline-block" }} className="status-dot" />
                <span style={{ fontSize: 9, color: "#1e293b", letterSpacing: "0.1em" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {mounted && (
            <span style={{ fontSize: 11, color: "#1e293b", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              <LiveClock />
            </span>
          )}

          {criticalCount > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: 10, padding: "5px 10px", borderRadius: 999,
              fontWeight: 700, letterSpacing: "0.06em",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} className="ping-fast" />
              {criticalCount} CRITICAL
            </div>
          )}

          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#818cf8", fontWeight: 700,
          }}>DR</div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", height: "calc(100vh - 58px)" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 260, flexShrink: 0,
          background: "rgba(2,8,23,0.88)", backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(99,102,241,0.08)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid rgba(99,102,241,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: "#1e293b", letterSpacing: "0.18em" }}>PATIENT REGISTRY</span>
              <span style={{ fontSize: 9, color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "2px 8px", borderRadius: 999 }}>
                {patients.length} ACTIVE
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients..."
                style={{
                  width: "100%", background: "rgba(15,23,42,0.7)",
                  border: "1px solid rgba(99,102,241,0.12)", borderRadius: 10,
                  padding: "8px 12px 8px 30px", fontSize: 12, color: "#e2e8f0",
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#1e293b", fontSize: 13 }}>⌕</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {filtered.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  selected={selectedPatient.id === p.id}
                  onClick={() => { setSelectedPatient(p); setView("dashboard"); }}
                />
              ))}
            </div>
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(99,102,241,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#1e293b", letterSpacing: "0.1em", marginBottom: 5 }}>
              <span>COHORT AVG RISK</span>
              <span style={{ color: avgRisk > 60 ? "#f59e0b" : "#10b981" }}>{avgRisk}/100</span>
            </div>
            <div style={{ height: 2, background: "rgba(15,23,42,0.8)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${avgRisk}%`, background: "linear-gradient(90deg, #6366f1, #06b6d4)", borderRadius: 2, boxShadow: "0 0 5px #6366f1" }} />
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 20 }}>

          {view === "dashboard" && (
            <>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                <StatCard label="Total Patients" value={patients.length} icon="◉" color="#6366f1" sub="Active cohort" />
                <StatCard label="Critical Alerts" value={criticalCount} icon="⚠" color="#ef4444" sub="Immediate action" />
                <StatCard label="Avg Risk Score" value={`${avgRisk}/100`} icon="◎" color="#f59e0b" sub="Cohort index" animate={false} />
                <StatCard label="AI Actions Today" value={72} icon="⚡" color="#10b981" sub="Automated tasks" />
              </div>

              {/* Patient detail card */}
              <div style={{
                background: "rgba(5,13,31,0.88)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(99,102,241,0.14)", borderRadius: 18,
                padding: "22px 26px", position: "relative", overflow: "hidden",
              }} className="hud-corners">
                <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)" }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
                  {/* Identity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 18,
                        background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 24, fontWeight: 800, color: "white",
                        boxShadow: "0 0 24px rgba(99,102,241,0.4)",
                      }}>{selectedPatient.name[0]}</div>
                      <div style={{ position: "absolute", inset: -3, borderRadius: 21, border: "1px solid rgba(99,102,241,0.2)", pointerEvents: "none" }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.01em" }}>{selectedPatient.name}</h2>
                      <p style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>{selectedPatient.age} years · {selectedPatient.condition}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                        <RiskBadge level={selectedPatient.riskLevel} />
                        <span style={{ fontSize: 10, color: "#1e293b", letterSpacing: "0.06em" }}>LAST VISIT: {selectedPatient.lastVisit}</span>
                        {selectedPatient.nextAppointment && (
                          <span style={{ fontSize: 10, color: "#1e293b", letterSpacing: "0.06em" }}>NEXT: {selectedPatient.nextAppointment}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      { label: "BP", value: selectedPatient.vitals.bp, unit: "mmHg", warn: selectedPatient.vitals.bp.startsWith("15") || selectedPatient.vitals.bp.startsWith("14") },
                      { label: "HR", value: `${selectedPatient.vitals.hr}`, unit: "bpm", warn: selectedPatient.vitals.hr > 90 },
                      { label: "TEMP", value: `${selectedPatient.vitals.temp}`, unit: "°C", warn: false },
                      { label: "SpO2", value: `${selectedPatient.vitals.spo2}`, unit: "%", warn: selectedPatient.vitals.spo2 < 95 },
                    ].map((v) => (
                      <div key={v.label} style={{
                        background: v.warn ? "rgba(245,158,11,0.07)" : "rgba(15,23,42,0.7)",
                        border: `1px solid ${v.warn ? "rgba(245,158,11,0.3)" : "rgba(99,102,241,0.1)"}`,
                        borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 76,
                      }}>
                        <p style={{ fontSize: 9, color: "#1e293b", letterSpacing: "0.12em", marginBottom: 5 }}>{v.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: v.warn ? "#fbbf24" : "#e2e8f0", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v.value}</p>
                        <p style={{ fontSize: 9, color: "#1e293b", marginTop: 3 }}>{v.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedPatient.medications.map((med) => (
                    <span key={med} style={{
                      fontSize: 11, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.1)",
                      color: "#475569", padding: "5px 14px", borderRadius: 999,
                    }}>◆ {med}</span>
                  ))}
                </div>

                {/* Alerts */}
                {selectedPatient.alerts.length > 0 && (
                  <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedPatient.alerts.map((alert, i) => (
                      <div key={i} style={{
                        fontSize: 11, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                        color: "#fbbf24", borderRadius: 10, padding: "6px 12px",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <span>⚠</span> {alert}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom row: trend + risk + open copilot */}
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    {/* Trend */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: selectedPatient.trend === "improving" ? "rgba(16,185,129,0.1)" : selectedPatient.trend === "declining" ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
                        border: `1px solid ${selectedPatient.trend === "improving" ? "rgba(16,185,129,0.25)" : selectedPatient.trend === "declining" ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.25)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                        color: selectedPatient.trend === "improving" ? "#10b981" : selectedPatient.trend === "declining" ? "#ef4444" : "#818cf8",
                      }}>
                        {selectedPatient.trend === "improving" ? "↑" : selectedPatient.trend === "declining" ? "↓" : "→"}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", textTransform: "capitalize" }}>{selectedPatient.trend}</p>
                        <p style={{ fontSize: 10, color: "#1e293b" }}>Trajectory</p>
                      </div>
                    </div>

                    {/* Risk gauge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 120 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: "#1e293b", letterSpacing: "0.1em" }}>RISK INDEX</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: selectedPatient.riskScore > 75 ? "#ef4444" : selectedPatient.riskScore > 50 ? "#f59e0b" : "#10b981" }}>
                            {selectedPatient.riskScore}/100
                          </span>
                        </div>
                        <div style={{ height: 5, background: "rgba(15,23,42,0.8)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${selectedPatient.riskScore}%`,
                            background: selectedPatient.riskScore > 75 ? "linear-gradient(90deg,#ef4444,#f97316)" : selectedPatient.riskScore > 50 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#6366f1,#10b981)",
                            borderRadius: 3, transition: "width 0.6s ease",
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Missed */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 28, fontWeight: 800, lineHeight: 1,
                        color: selectedPatient.missedAppointments > 1 ? "#ef4444" : "#10b981",
                      }}>{selectedPatient.missedAppointments}</span>
                      <span style={{ fontSize: 10, color: "#1e293b", lineHeight: 1.4 }}>missed<br />appts</span>
                    </div>
                  </div>

                  {/* Open Copilot button */}
                  <button
                    onClick={() => setCopilotOpen(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))",
                      border: "1px solid rgba(99,102,241,0.35)",
                      borderRadius: 12, padding: "10px 20px", cursor: "pointer",
                      boxShadow: "0 0 20px rgba(99,102,241,0.15)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(99,102,241,0.3)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(99,102,241,0.15)"; }}
                  >
                    <div style={{ position: "relative", width: 28, height: 28 }}>
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(99,102,241,0.2)" }} className="ping-slow" />
                      <div style={{ position: "relative", width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "white" }}>◈</div>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em" }}>Ask AI Copilot</p>
                      <p style={{ fontSize: 10, color: "#475569" }}>Neural analysis for {selectedPatient.name.split(" ")[0]}</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {view === "analytics" && <AnalyticsPanel />}
          {view === "workflow" && <WorkflowPanel />}
        </main>
      </div>

      {/* ── Floating Copilot FAB ── */}
      {!copilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 30,
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            border: "none", cursor: "pointer",
            boxShadow: "0 0 30px rgba(99,102,241,0.5), 0 4px 20px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "white",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(99,102,241,0.7), 0 4px 20px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(99,102,241,0.5), 0 4px 20px rgba(0,0,0,0.4)";
          }}
          title="Open AI Copilot"
        >
          ◈
          {/* Pulse ring */}
          <span style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.4)",
          }} className="ping-slow" />
        </button>
      )}

      {/* ── Copilot Panel ── */}
      <CopilotChat
        patient={selectedPatient}
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
}
