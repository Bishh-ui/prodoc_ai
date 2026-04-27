"use client";
import { ReactNode, useEffect, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  sub?: string;
  animate?: boolean;
}

export function StatCard({ label, value, icon, color, sub, animate = true }: StatCardProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate || typeof value !== "number") { setDisplayed(value); return; }
    let start = 0;
    const end = value as number;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplayed(end); clearInterval(timer); }
      else setDisplayed(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, animate]);

  return (
    <div
      className="hud-corners card-hover relative overflow-hidden"
      style={{
        background: "rgba(5,13,31,0.8)",
        border: `1px solid ${color}22`,
        borderRadius: 16,
        padding: "20px",
      }}
    >
      {/* Corner accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${color}15, transparent 70%)` }} />

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(100,116,139,0.8)" }}>{label}</p>
        <div
          style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ color, fontSize: 16 }}>{icon}</span>
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold tracking-tight" style={{ color: "white", fontVariantNumeric: "tabular-nums" }}>
        {typeof value === "string" ? value : displayed}
      </p>

      {/* Sub + glow bar */}
      {sub && <p className="text-xs mt-1" style={{ color: "rgba(100,116,139,0.7)" }}>{sub}</p>}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, marginTop: 12, borderRadius: 2, boxShadow: `0 0 6px ${color}` }} />
    </div>
  );
}
