"use client";
import { useState } from "react";
import { workflowTasks, WorkflowTask } from "@/lib/data";

const typeConfig: Record<WorkflowTask["type"], { icon: string; color: string }> = {
  alert:      { icon: "⚠", color: "#ef4444" },
  "lab-order":{ icon: "⬡", color: "#06b6d4" },
  referral:   { icon: "◎", color: "#818cf8" },
  "follow-up":{ icon: "◈", color: "#10b981" },
};

const priorityConfig: Record<WorkflowTask["priority"], { color: string; label: string }> = {
  urgent: { color: "#ef4444", label: "URGENT" },
  normal: { color: "#818cf8", label: "NORMAL" },
  low:    { color: "#475569", label: "LOW" },
};

export function WorkflowPanel() {
  const [tasks, setTasks] = useState(workflowTasks);
  const [completing, setCompleting] = useState<string | null>(null);

  function complete(id: string) {
    setCompleting(id);
    setTimeout(() => { setTasks((t) => t.filter((task) => task.id !== id)); setCompleting(null); }, 500);
  }

  const urgentCount = tasks.filter((t) => t.priority === "urgent").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      {/* Main task list */}
      <div style={{ background: "rgba(5,13,31,0.85)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 18, padding: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.05em" }}>AI WORKFLOW ENGINE</p>
            <p style={{ fontSize: 10, color: "#334155", marginTop: 2, letterSpacing: "0.08em" }}>AUTONOMOUS TASK ORCHESTRATION</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {urgentCount > 0 && (
              <span style={{ fontSize: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "4px 12px", borderRadius: 999, letterSpacing: "0.08em" }}>
                {urgentCount} URGENT
              </span>
            )}
            <span style={{ fontSize: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", padding: "4px 12px", borderRadius: 999, letterSpacing: "0.08em" }}>
              {tasks.length} PENDING
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#334155", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>◎</div>
              All tasks resolved
            </div>
          )}
          {tasks.map((task) => {
            const tc = typeConfig[task.type];
            const pc = priorityConfig[task.priority];
            return (
              <div key={task.id} style={{
                background: "rgba(15,23,42,0.6)", border: `1px solid rgba(99,102,241,0.1)`,
                borderLeft: `3px solid ${tc.color}`,
                borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
                opacity: completing === task.id ? 0 : 1,
                transform: completing === task.id ? "translateX(30px)" : "none",
                transition: "all 0.4s ease",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tc.color}12`, border: `1px solid ${tc.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: tc.color, flexShrink: 0 }}>
                  {tc.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{task.patient}</p>
                    <span style={{ fontSize: 9, background: `${pc.color}12`, color: pc.color, border: `1px solid ${pc.color}30`, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.1em" }}>
                      {pc.label}
                    </span>
                    {task.aiGenerated && (
                      <span style={{ fontSize: 9, background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.25)", padding: "2px 8px", borderRadius: 999, letterSpacing: "0.08em" }}>
                        ◈ AI GENERATED
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{task.description}</p>
                  <p style={{ fontSize: 10, color: "#1e293b", marginTop: 4 }}>{new Date(task.createdAt).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => complete(task.id)}
                  style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                    background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                    color: "#10b981", fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.08)"; }}
                >
                  ✓
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "TASKS COMPLETED TODAY", value: "18", color: "#10b981", icon: "◎" },
          { label: "AI GENERATED", value: "14", color: "#06b6d4", icon: "◈" },
          { label: "AVG RESOLUTION TIME", value: "4.2m", color: "#818cf8", icon: "⬡" },
          { label: "AUTOMATION RATE", value: "78%", color: "#f59e0b", icon: "⚡" },
        ].map((s) => (
          <div key={s.label} style={{ background: "rgba(5,13,31,0.85)", border: `1px solid ${s.color}18`, borderRadius: 14, padding: "16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${s.color}10, transparent 70%)` }} />
            <p style={{ fontSize: 9, color: "#334155", letterSpacing: "0.12em", marginBottom: 8 }}>{s.label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0" }}>{s.value}</span>
            </div>
            <div style={{ height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)`, marginTop: 10, borderRadius: 2, boxShadow: `0 0 6px ${s.color}` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
