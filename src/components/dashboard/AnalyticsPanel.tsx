"use client";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { analyticsData, patients } from "@/lib/data";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(5,13,31,0.95)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 11 }}>
      {label && <p style={{ color: "#475569", marginBottom: 6, letterSpacing: "0.05em" }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill, marginBottom: 2 }}>{p.name}: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{p.value}</span></p>
      ))}
    </div>
  );
};

const radialData = [
  { name: "Critical", value: 87, fill: "#ef4444" },
  { name: "High", value: 70, fill: "#f59e0b" },
  { name: "Medium", value: 54, fill: "#818cf8" },
  { name: "Low", value: 22, fill: "#10b981" },
];

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.06em" }}>{title}</p>
      <p style={{ fontSize: 10, color: "#334155", marginTop: 2, letterSpacing: "0.05em" }}>{sub}</p>
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(5,13,31,0.85)", border: "1px solid rgba(99,102,241,0.13)",
      borderRadius: 16, padding: "18px 20px", position: "relative", overflow: "hidden",
      ...style,
    }}>
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)" }} />
      {children}
    </div>
  );
}

export function AnalyticsPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Weekly engagement */}
        <Panel>
          <SectionHeader title="WEEKLY ENGAGEMENT" sub="APPOINTMENTS · MESSAGES · AI ACTIONS" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analyticsData.weeklyEngagement}>
              <defs>
                {[["gA","#6366f1"],["gM","#06b6d4"],["gAI","#10b981"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#334155", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#334155", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#6366f1" fill="url(#gA)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="messages" name="Messages" stroke="#06b6d4" fill="url(#gM)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="aiActions" name="AI Actions" stroke="#10b981" fill="url(#gAI)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {[["Appointments","#6366f1"],["Messages","#06b6d4"],["AI Actions","#10b981"]].map(([n,c]) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 2, background: c as string, borderRadius: 2, boxShadow: `0 0 4px ${c}` }} />
                <span style={{ fontSize: 10, color: "#334155" }}>{n}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Radial risk */}
        <Panel>
          <SectionHeader title="RISK DISTRIBUTION" sub="PATIENT COHORT BREAKDOWN" />
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "rgba(15,23,42,0.5)" }} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {radialData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill, boxShadow: `0 0 4px ${d.fill}` }} />
                  <span style={{ fontSize: 10, color: "#475569" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 10, color: d.fill, fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Risk trend */}
        <Panel>
          <SectionHeader title="RISK TREND" sub="MONTHLY CRITICAL / HIGH / MEDIUM" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={analyticsData.riskTrend} barSize={14} barGap={3}>
              <XAxis dataKey="month" tick={{ fill: "#334155", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#334155", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[3,3,0,0]} />
              <Bar dataKey="high" name="High" fill="#f59e0b" radius={[3,3,0,0]} />
              <Bar dataKey="medium" name="Medium" fill="#6366f1" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Patient risk leaderboard */}
        <Panel>
          <SectionHeader title="RISK LEADERBOARD" sub="HIGHEST RISK PATIENTS" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...patients].sort((a, b) => b.riskScore - a.riskScore).map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: "#1e293b", width: 14, textAlign: "right", flexShrink: 0 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{p.name.split(" ")[0]}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: p.riskScore > 75 ? "#ef4444" : p.riskScore > 50 ? "#f59e0b" : "#10b981" }}>{p.riskScore}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(15,23,42,0.8)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${p.riskScore}%`,
                      background: p.riskScore > 75 ? "linear-gradient(90deg,#ef4444,#f97316)" : p.riskScore > 50 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#6366f1,#818cf8)",
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
