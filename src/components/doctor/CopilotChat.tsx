"use client";
import { useState, useRef, useEffect } from "react";
import { Patient } from "@/lib/data";
import { RiskBadge } from "@/components/ui/RiskBadge";

interface Message {
  role: "user" | "ai";
  content: string;
  actions?: string[];
}

const QUICK_PROMPTS = [
  "Summarize this patient",
  "What are the risk factors?",
  "Current medications?",
  "Latest vitals?",
];

export function CopilotChat({ patient }: { patient: Patient }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: `I'm your AI Copilot for ${patient.name}. Ask me anything about this patient's history, risk factors, medications, or get an AI-generated summary.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedText]);

  // Typewriter effect for last AI message
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role !== "ai") return;
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(last.content.slice(0, i + 1));
      i++;
      if (i >= last.content.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [messages]);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, question }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "ai", content: data.answer, actions: data.suggestedActions },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "ai", content: "Connection error. Please retry." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Clinical Copilot</p>
            <p className="text-xs text-slate-400">{patient.name}</p>
          </div>
        </div>
        <RiskBadge level={patient.riskLevel} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const text = isLast && msg.role === "ai" ? displayedText : msg.content;
          return (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                style={{
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #6366f1, #818cf8)"
                      : "rgba(30,41,59,0.8)",
                  border: msg.role === "ai" ? "1px solid rgba(99,102,241,0.2)" : "none",
                }}
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm text-white"
              >
                {text}
                {isLast && msg.role === "ai" && displayedText.length < msg.content.length && (
                  <span className="cursor ml-0.5 text-indigo-400">|</span>
                )}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.actions.map((a, j) => (
                      <div
                        key={j}
                        className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg px-2 py-1"
                      >
                        ⚡ {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${i * 0.15}s` }}
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-xs px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 pt-0 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about this patient..."
          className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Send
        </button>
      </div>
    </div>
  );
}
