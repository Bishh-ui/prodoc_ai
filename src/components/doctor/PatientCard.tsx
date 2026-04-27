"use client";
import { Patient } from "@/lib/data";
import { RiskBadge } from "@/components/ui/RiskBadge";

interface Props { patient: Patient; selected: boolean; onClick: () => void; }

const trendColor = { improving: "#10b981", stable: "#818cf8", declining: "#ef4444" };
const trendLabel = { improving: "↑ Improving", stable: "→ Stable", declining: "↓ Declining" };

export function PatientCard({ patient, selected, onClick }: Props) {
  const tc = trendColor[patient.trend];

  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? "rgba(99,102,241,0.1)" : "rgba(5,13,31,0.6)",
        border: selected ? "1px solid rgba(99,102,241,0.45)" : "1px solid rgba(99,102,241,0.08)",
        boxShadow: selected ? "0 0 24px rgba(99,102,241,0.12), inset 0 0 24px rgba(99,102,241,0.04)" : "none",
        borderRadius: 14,
        padding: "14px",
        width: "100%",
        textAlign: "left",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Selected indicator line */}
      {selected && (
        <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 2, background: "linear-gradient(180deg, transparent, #6366f1, transparent)", borderRadius: 2 }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${tc}30, ${tc}10)`,
            border: `1px solid ${tc}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: tc,
          }}>
            {patient.name[0]}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.2 }}>{patient.name}</p>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{patient.age}y · {patient.condition.split("+")[0].trim()}</p>
          </div>
        </div>
        <RiskBadge level={patient.riskLevel} />
      </div>

      {/* Risk bar */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "#475569", letterSpacing: "0.05em" }}>RISK INDEX</span>
          <span style={{ fontSize: 10, color: tc, fontWeight: 600 }}>{trendLabel[patient.trend]} · {patient.riskScore}</span>
        </div>
        <div style={{ height: 3, background: "rgba(30,41,59,0.8)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${patient.riskScore}%`,
            background: patient.riskScore > 75
              ? "linear-gradient(90deg, #ef4444, #f97316)"
              : patient.riskScore > 50
              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
              : "linear-gradient(90deg, #6366f1, #818cf8)",
            borderRadius: 4,
            boxShadow: `0 0 6px ${tc}`,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Alerts */}
      {patient.alerts.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {patient.alerts.slice(0, 1).map((a, i) => (
            <span key={i} style={{
              fontSize: 10, background: "rgba(239,68,68,0.08)", color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)", padding: "2px 8px", borderRadius: 999,
            }}>
              ⚠ {a.length > 28 ? a.slice(0, 28) + "…" : a}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
