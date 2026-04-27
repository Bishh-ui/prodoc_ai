export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  nextAppointment: string | null;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  missedAppointments: number;
  medications: string[];
  vitals: { bp: string; hr: number; temp: number; spo2: number };
  aiSummary: string;
  alerts: string[];
  trend: "improving" | "stable" | "declining";
}

export interface WorkflowTask {
  id: string;
  type: "follow-up" | "lab-order" | "referral" | "alert";
  patient: string;
  priority: "urgent" | "normal" | "low";
  description: string;
  aiGenerated: boolean;
  createdAt: string;
}

export const patients: Patient[] = [
  {
    id: "P001",
    name: "Ahmed Al-Rashid",
    age: 67,
    condition: "Type 2 Diabetes + Hypertension",
    lastVisit: "2026-04-10",
    nextAppointment: "2026-05-02",
    riskLevel: "critical",
    riskScore: 87,
    missedAppointments: 3,
    medications: ["Metformin 1000mg", "Lisinopril 10mg", "Atorvastatin 20mg"],
    vitals: { bp: "158/96", hr: 92, temp: 37.2, spo2: 96 },
    aiSummary:
      "Patient shows escalating BP trend over 3 visits. Missed 3 consecutive follow-ups. HbA1c last recorded at 9.2% — significantly above target. High risk of cardiovascular event within 90 days. Immediate re-engagement recommended.",
    alerts: ["BP above threshold for 3 visits", "HbA1c uncontrolled", "3 missed appointments"],
    trend: "declining",
  },
  {
    id: "P002",
    name: "Sara Khalid",
    age: 34,
    condition: "Gestational Diabetes",
    lastVisit: "2026-04-22",
    nextAppointment: "2026-04-30",
    riskLevel: "high",
    riskScore: 71,
    missedAppointments: 1,
    medications: ["Insulin Aspart", "Folic Acid 5mg"],
    vitals: { bp: "130/85", hr: 88, temp: 36.8, spo2: 98 },
    aiSummary:
      "28-week pregnancy with gestational diabetes. Blood glucose trending upward this week. One missed appointment last month. Requires close monitoring — fetal growth scan overdue by 2 weeks.",
    alerts: ["Fetal scan overdue", "Glucose trending up"],
    trend: "stable",
  },
  {
    id: "P003",
    name: "Mohammed Hassan",
    age: 52,
    condition: "Post-MI Recovery",
    lastVisit: "2026-04-18",
    nextAppointment: "2026-05-05",
    riskLevel: "high",
    riskScore: 68,
    missedAppointments: 0,
    medications: ["Aspirin 100mg", "Clopidogrel 75mg", "Bisoprolol 5mg", "Ramipril 5mg"],
    vitals: { bp: "125/80", hr: 72, temp: 36.6, spo2: 97 },
    aiSummary:
      "6 weeks post-MI. Adherent to medication. Cardiac rehab attendance: 80%. Ejection fraction improved from 35% to 42% since discharge. Stable trajectory — continue current protocol.",
    alerts: ["Cardiac rehab follow-up due"],
    trend: "improving",
  },
  {
    id: "P004",
    name: "Fatima Al-Zahra",
    age: 45,
    condition: "Chronic Kidney Disease Stage 3",
    lastVisit: "2026-03-30",
    nextAppointment: null,
    riskLevel: "medium",
    riskScore: 54,
    missedAppointments: 2,
    medications: ["Amlodipine 5mg", "Erythropoietin"],
    vitals: { bp: "140/88", hr: 78, temp: 36.9, spo2: 97 },
    aiSummary:
      "CKD Stage 3 with no appointment scheduled. eGFR last recorded at 42 — borderline for Stage 4 progression. Dietary counseling not completed. Recommend urgent scheduling.",
    alerts: ["No appointment scheduled", "eGFR borderline"],
    trend: "stable",
  },
  {
    id: "P005",
    name: "Omar Yusuf",
    age: 28,
    condition: "Asthma",
    lastVisit: "2026-04-25",
    nextAppointment: "2026-06-01",
    riskLevel: "low",
    riskScore: 22,
    missedAppointments: 0,
    medications: ["Salbutamol inhaler", "Fluticasone 100mcg"],
    vitals: { bp: "118/74", hr: 68, temp: 36.5, spo2: 99 },
    aiSummary:
      "Well-controlled asthma. No exacerbations in 6 months. Inhaler technique confirmed good. Continue current management.",
    alerts: [],
    trend: "improving",
  },
];

export const workflowTasks: WorkflowTask[] = [
  {
    id: "T001",
    type: "alert",
    patient: "Ahmed Al-Rashid",
    priority: "urgent",
    description: "Send urgent re-engagement message — 3 missed appointments + critical BP",
    aiGenerated: true,
    createdAt: "2026-04-27T08:00:00",
  },
  {
    id: "T002",
    type: "lab-order",
    patient: "Sara Khalid",
    priority: "urgent",
    description: "Order fetal growth scan — overdue by 2 weeks",
    aiGenerated: true,
    createdAt: "2026-04-27T08:05:00",
  },
  {
    id: "T003",
    type: "follow-up",
    patient: "Fatima Al-Zahra",
    priority: "urgent",
    description: "Schedule CKD follow-up — no appointment on record",
    aiGenerated: true,
    createdAt: "2026-04-27T08:10:00",
  },
  {
    id: "T004",
    type: "referral",
    patient: "Mohammed Hassan",
    priority: "normal",
    description: "Refer to cardiac rehab for final 4 sessions",
    aiGenerated: false,
    createdAt: "2026-04-27T09:00:00",
  },
];

export const analyticsData = {
  riskDistribution: [
    { name: "Critical", value: 1, color: "#ef4444" },
    { name: "High", value: 2, color: "#f59e0b" },
    { name: "Medium", value: 1, color: "#6366f1" },
    { name: "Low", value: 1, color: "#10b981" },
  ],
  weeklyEngagement: [
    { day: "Mon", appointments: 12, messages: 34, aiActions: 8 },
    { day: "Tue", appointments: 18, messages: 41, aiActions: 12 },
    { day: "Wed", appointments: 15, messages: 38, aiActions: 10 },
    { day: "Thu", appointments: 22, messages: 52, aiActions: 18 },
    { day: "Fri", appointments: 19, messages: 47, aiActions: 15 },
    { day: "Sat", appointments: 8, messages: 21, aiActions: 6 },
    { day: "Sun", appointments: 5, messages: 14, aiActions: 3 },
  ],
  riskTrend: [
    { month: "Jan", critical: 3, high: 8, medium: 12 },
    { month: "Feb", critical: 4, high: 7, medium: 11 },
    { month: "Mar", critical: 2, high: 9, medium: 10 },
    { month: "Apr", critical: 1, high: 6, medium: 9 },
  ],
};
