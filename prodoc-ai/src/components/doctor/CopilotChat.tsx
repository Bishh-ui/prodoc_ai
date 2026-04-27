"use client";
import { useState, useRef, useEffect } from "react";
import { Patient } from "@/lib/data";
import { RiskBadge } from "@/components/ui/RiskBadge";

interface Message { role: "user" | "ai"; content: string; actions?: string[]; }

const QUICK_PROMPTS = ["Summarize patient", "Risk factors?", "Medications?", "Latest vitals?"];

interface Props {
  patient: Patient;
  open: boolean;
  onClose: () => void;
}

export function CopilotChat({ patient, open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "ai",
    content: `Neural link established for ${patient.name}. Ask me about history, risk vectors, medications, or request a full diagnostic summary.`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "ai", content: `Neural link established for ${patient.name}. Ask me about history, risk vectors, medications, or request a full diagnostic summary.` }]);
  }, [patient.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, displayedText]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role !== "ai") return;
    setDisplayedText("");
    let i = 0;
    const iv = setInterval(() => { setDisplayedText(last.content.slice(0, i + 1)); i++; if (i >= last.content.length) clearInterval(iv); }, 14);
    return () => clearInterval(iv);
  }, [messages]);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId: patient.id, question }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", content: data.answer, actions: data.suggestedActions }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", content: "Signal lost. Please retry." }]);
    } finally { setLoading(false); }
  }

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(2,8,23,0.6)", backdropFilter: "blur(4px)", zIndex: 40 }} />}
      <div style={{ position: "fixed", bottom: 0, right: 0, width: "min(480px, 100vw)", height: "min(620px, 90vh)", zIndex: 50, transform: open ? "translateY(0)" : "translateY(110%)", transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)", display: "flex", flexDirection: "column", background: "rgba(5,13,31,0.97)", border: "1px solid rgba(99,102,241,0.25)", borderBottom: "none", borderRadius: "20px 20px 0 0", boxShadow: "0 -8px 60px rgba(99,102,241,0.15)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)" }} />
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(99,102,241,0.05)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }} className="ping-slow" />
              <div style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "white" }}>&#9672;</div>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.06em" }}>NEURAL COPILOT</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b981", display: "inline-block" }} className="status-dot" />
                <span style={{ fontSize: 10, color: "#475569" }}>{patient.name.toUpperCase()}</span>
                <RiskBadge level={patient.riskLevel} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.08)", color: "#64748b", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const text = isLast && msg.role === "ai" ? displayedText : msg.content;
            return (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
                {msg.role === "ai" && <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", flexShrink: 0, marginTop: 2 }}>&#9672;</div>}
                <div style={{ maxWidth: "80%", background: msg.role === "user" ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(129,140,248,0.15))" : "rgba(15,23,42,0.8)", border: msg.role === "user" ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(99,102,241,0.1)", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding: "10px 14px", fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>
                  {text}
                  {isLast && msg.role === "ai" && displayedText.length < msg.content.length && <span className="cursor" style={{ color: "#6366f1", marginLeft: 2 }}>|</span>}
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {msg.actions.map((a, j) => <div key={j} style={{ fontSize: 11, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24", borderRadius: 8, padding: "4px 10px" }}>&#9889; {a}</div>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", flexShrink: 0 }}>&#9672;</div>
              <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: "4px 16px 16px 16px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block", animationDelay: `${i * 0.18}s` }} className="animate-bounce" />)}
                <span style={{ fontSize: 11, color: "#334155", marginLeft: 6 }}>Processing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
          {QUICK_PROMPTS.map((p) => <button key={p} onClick={() => send(p)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer" }}>{p}</button>)}
        </div>
        <div style={{ padding: "0 16px 20px", display: "flex", gap: 8, flexShrink: 0 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Query the neural copilot..." style={{ flex: 1, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#e2e8f0", outline: "none" }} onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; }} onBlur={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; }} />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none", borderRadius: 12, padding: "10px 18px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: loading || !input.trim() ? 0.4 : 1, letterSpacing: "0.05em" }}>SEND</button>
        </div>
      </div>
    </>
  );
}
