"use client";
import { useState, useEffect } from "react";
import { patients } from "@/lib/data";
import { PatientCard } from "@/components/doctor/PatientCard";
import { CopilotChat } from "@/components/doctor/CopilotChat";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { WorkflowPanel } from "@/components/dashboard/WorkflowPanel";
import { StatCard } from "@/components/ui/StatCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Background } from "@/components/ui/Background";

type Tab = "copilot" | "analytics" | "workflow";

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
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [activeTab, setActiveTab] = useState<Tab>("copilot");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const criticalCount = patients.filter((p) => p.riskLevel === "critical").length;
  const avgRisk = Math.round(patients.reduce((s, p) => s + p.riskScore, 0) / patients.length);
  const filtered = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase()));

  const tabConfig = [
    { id: "copilot" as Tab, label: "NEURAL COPILOT", icon: "◈" },
    { id: "analytics" as Tab, label: "ANALYTICS", icon: "◎" },
    { id: "workflow" as Tab, label: "WORKFLOW", icon: "⬡" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#020817", position: "relative" }}>
      <Background />

      {/* ── Top Navigation ── */}
      <nav style={{
        position: "relative", zIndex: 10,
        background: "rgba(2,8,23,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
        boxShadow: "0 1px 0 rgba(99,102,241,0.1), 0 4px 24px rgba(0,0,0,0.4)",
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "white", fontWeight: 900,
              boxShadow: "0 0 20px rgba(99,102,241,0.5)",
            }}>P</div>
            <div style={{ position: "absolute", inset: -2, borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)", animation: "spin-border 4s linear infinite" }} className="animated-border" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.05em" }}>PRODOC</span>
              <span className="shimmer-text" style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.05em" }}>AI</span>
            </div>
            <p style={{ fontSize: 9, color: "#334155", letterSpacing: "0.15em", marginTop: -1 }}>CLINICAL INTELLIGENCE PLATFORM</p>
          </div>
        </div>

        {/* Center — system status */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {[
            { label: "NEURAL ENGINE", status: "ONLINE", color: "#10b981" },
            { label: "RAG PIPELINE", status: "ACTIVE", color: "#06b6d4" },
            { label: "RISK MODEL", status: "v2.4", color: "#818cf8" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}`, display: "inline-block" }} className="status-dot" />
              <span style={{ fontSize: 9, color: "#334155", letterSpacing: "0.1em" }}>{s.label}</span>
              <span style={{ fontSize: 9, color: s.color, letterSpacing: "0.08em" }}>{s.status}</span>
            </div>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Live clock */}
          <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {mounted && <LiveClock />}
          </div>

          {criticalCount > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: 11, padding: "5px 12px", borderRadius: 999,
              boxShadow: "0 0 12px rgba(239,68,68,0.15)",
            }} className="ping-fast">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              {criticalCount} CRITICAL
            </div>
          )}

          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: "0.05em",
          }}>DR</div>
        </div>
      </nav>

      {/* ── Main Layout ── */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", height: "calc(100vh - 56px)" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 272, flexShrink: 0,
          background: "rgba(2,8,23,0.85)", backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(99,102,241,0.1)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Sidebar header */}
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: "#334155", letterSpacing: "0.15em" }}>PATIENT REGISTRY</span>
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
                  width: "100%", background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10,
                  padding: "8px 12px 8px 32px", fontSize: 12, color: "#e2e8f0",
                  outline: "none",
                }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#334155", fontSize: 12 }}>⌕</span>
            </div>
          </div>

          {/* Patient list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map((p) => (
                <PatientCard key={p.id} patient={p} selected={selectedPatient.id === p.id} onClick={() => setSelectedPatient(p)} />
              ))}
            </div>
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(99,102,241,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155" }}>
              <span>AVG RISK</span>
              <span style={{ color: avgRisk > 60 ? "#f59e0b" : "#10b981" }}>{avgRisk}/100</span>
            </div>
            <div style={{ height: 2, background: "rgba(30,41,59,0.8)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${avgRisk}%`, background: "linear-gradient(90deg, #6366f1, #06b6d4)", borderRadius: 2, boxShadow: "0 0 6px #6366f1" }} />
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <StatCard label="Total Patients" value={patients.length} icon="◉" color="#6366f1" sub="Active cohort" />
            <StatCard label="Critical Alerts" value={criticalCount} icon="⚠" color="#ef4444" sub="Immediate action" />
            <StatCard label="Avg Risk Score" value={`${avgRisk}/100`} icon="◎" color="#f59e0b" sub="Cohort index" animate={false} />
            <StatCard label="AI Actions Today" value={72} icon="⚡" color="#10b981" sub="Automated tasks" />
          </div>

          {/* Patient HUD */}
          <div style={{
            background: "rgba(5,13,31,0.85)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(99,102,241,0.15)", borderRadius: 18,
            padding: "18px 22px", position: "relative", overflow: "hidden",
            boxShadow: "0 0 40px rgba(99,102,241,0.06)",
          }} className="hud-corners">
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: 1, background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)" }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              {/* Patient identity */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 800, color: "white",
                    boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                  }}>{selectedPatient.name[0]}</div>
                  <div style={{ position: "absolute", inset: -3, borderRadius: 19, border: "1px solid rgba(99,102,241,0.25)", pointerEvents: "none" }} />
                </div>
                <div>
                  <h1 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.02em" }}>{selectedPatient.name}</h1>
                  <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                    {selectedPatient.age} years · {selectedPatient.condition}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <RiskBadge level={selectedPatient.riskLevel} />
                    <span style={{ fontSize: 10, color: "#334155", letterSpacing: "0.05em" }}>
                      LAST VISIT: {selectedPatient.lastVisit}
                    </span>
                    {selectedPatient.nextAppointment && (
                      <span style={{ fontSize: 10, color: "#334155", letterSpacing: "0.05em" }}>
                        NEXT: {selectedPatient.nextAppointment}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vitals HUD */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { label: "BLOOD PRESSURE", value: selectedPatient.vitals.bp, unit: "mmHg", warn: selectedPatient.vitals.bp.startsWith("15") || selectedPatient.vitals.bp.startsWith("14") },
                  { label: "HEART RATE", value: `${selectedPatient.vitals.hr}`, unit: "bpm", warn: selectedPatient.vitals.hr > 90 },
                  { label: "TEMPERATURE", value: `${selectedPatient.vitals.temp}`, unit: "°C", warn: false },
                  { label: "SpO2", value: `${selectedPatient.vitals.spo2}`, unit: "%", warn: selectedPatient.vitals.spo2 < 95 },
                ].map((v) => (
                  <div key={v.label} style={{
                    background: v.warn ? "rgba(245,158,11,0.06)" : "rgba(15,23,42,0.6)",
                    border: `1px solid ${v.warn ? "rgba(245,158,11,0.25)" : "rgba(99,102,241,0.1)"}`,
                    borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 80,
                  }}>
                    <p style={{ fontSize: 9, color: "#334155", letterSpacing: "0.1em", marginBottom: 4 }}>{v.label}</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: v.warn ? "#fbbf24" : "#e2e8f0", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v.value}</p>
                    <p style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>{v.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedPatient.medications.map((med) => (
                <span key={med} style={{
                  fontSize: 11, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.12)",
                  color: "#64748b", padding: "4px 12px", borderRadius: 999,
                }}>
                  ◆ {med}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, background: "rgba(5,13,31,0.8)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: 14, padding: 4, width: "fit-content" }}>
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 20px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.08em", cursor: "pointer", border: "none",
                  background: activeTab === tab.id ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent",
                  color: activeTab === tab.id ? "white" : "#334155",
                  boxShadow: activeTab === tab.id ? "0 0 16px rgba(99,102,241,0.3)" : "none",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "copilot" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
              <CopilotChat patient={selectedPatient} />

              {/* Side panels */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* AI Insights */}
                <div style={{ background: "rgba(5,13,31,0.85)", border: "1px solid rgba(99,102,241,0.13)", borderRadius: 16, padding: "16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)" }} />
                  <p style={{ fontSize: 9, color: "#334155", letterSpacing: "0.15em", marginBottom: 12 }}>AI DIAGNOSTIC INSIGHTS</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selectedPatient.alerts.length === 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#10b981" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }} />
                        All parameters nominal
                      </div>
                    ) : (
                      selectedPatient.alerts.map((alert, i) => (
                        <div key={i} style={{
                          fontSize: 11, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                          color: "#fbbf24", borderRadius: 10, padding: "8px 10px",
                          display: "flex", alignItems: "flex-start", gap: 6,
                        }}>
                          <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                          <span>{alert}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Trend + Score */}
                <div style={{ background: "rgba(5,13,31,0.85)", border: "1px solid rgba(99,102,241,0.13)", borderRadius: 16, padding: "16px" }}>
                  <p style={{ fontSize: 9, color: "#334155", letterSpacing: "0.15em", marginBottom: 12 }}>PATIENT TRAJECTORY</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: selectedPatient.trend === "improving" ? "rgba(16,185,129,0.1)" : selectedPatient.trend === "declining" ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
                      border: `1px solid ${selectedPatient.trend === "improving" ? "rgba(16,185,129,0.3)" : selectedPatient.trend === "declining" ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                      color: selectedPatient.trend === "improving" ? "#10b981" : selectedPatient.trend === "declining" ? "#ef4444" : "#818cf8",
                    }}>
                      {selectedPatient.trend === "improving" ? "↑" : selectedPatient.trend === "declining" ? "↓" : "→"}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", textTransform: "capitalize" }}>{selectedPatient.trend}</p>
                      <p style={{ fontSize: 10, color: "#334155" }}>Based on last 3 visits</p>
                    </div>
                  </div>

                  {/* Risk gauge */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, color: "#334155", letterSpacing: "0.1em" }}>RISK INDEX</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: selectedPatient.riskScore > 75 ? "#ef4444" : selectedPatient.riskScore > 50 ? "#f59e0b" : "#10b981" }}>
                        {selectedPatient.riskScore} / 100
                      </span>
                    </div>
                    <div style={{ height: 6, background: "rgba(15,23,42,0.8)", borderRadius: 4, overflow: "hidden", border: "1px solid rgba(99,102,241,0.08)" }}>
                      <div style={{
                        height: "100%", width: `${selectedPatient.riskScore}%`,
                        background: selectedPatient.riskScore > 75 ? "linear-gradient(90deg, #ef4444, #f97316)" : selectedPatient.riskScore > 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #6366f1, #10b981)",
                        borderRadius: 4, boxShadow: "0 0 8px currentColor", transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>
                </div>

                {/* Missed appointments */}
                <div style={{ background: "rgba(5,13,31,0.85)", border: "1px solid rgba(99,102,241,0.13)", borderRadius: 16, padding: "16px" }}>
                  <p style={{ fontSize: 9, color: "#334155", letterSpacing: "0.15em", marginBottom: 10 }}>MISSED APPOINTMENTS</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{
                      fontSize: 40, fontWeight: 800, lineHeight: 1,
                      color: selectedPatient.missedAppointments > 1 ? "#ef4444" : "#10b981",
                      textShadow: `0 0 20px ${selectedPatient.missedAppointments > 1 ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
                    }}>
                      {selectedPatient.missedAppointments}
                    </span>
                    <span style={{ fontSize: 11, color: "#334155" }}>in last<br />6 months</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && <AnalyticsPanel />}
          {activeTab === "workflow" && <WorkflowPanel />}
        </main>
      </div>
    </div>
  );
}
