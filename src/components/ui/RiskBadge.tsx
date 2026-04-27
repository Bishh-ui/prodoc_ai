import { RiskLevel } from "@/lib/data";

const config: Record<RiskLevel, { label: string; color: string; glow: string }> = {
  critical: { label: "CRITICAL", color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
  high:     { label: "HIGH",     color: "#f59e0b", glow: "rgba(245,158,11,0.35)" },
  medium:   { label: "MEDIUM",   color: "#818cf8", glow: "rgba(99,102,241,0.35)" },
  low:      { label: "LOW",      color: "#10b981", glow: "rgba(16,185,129,0.35)" },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const c = config[level];
  return (
    <span
      style={{
        background: `${c.color}12`,
        color: c.color,
        border: `1px solid ${c.color}40`,
        boxShadow: `0 0 8px ${c.glow}`,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.color,
          boxShadow: `0 0 6px ${c.color}`,
          display: "inline-block",
          flexShrink: 0,
        }}
        className={level === "critical" ? "ping-fast" : level === "high" ? "status-dot" : ""}
      />
      {c.label}
    </span>
  );
}
