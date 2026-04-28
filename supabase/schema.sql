-- ── Patients ──────────────────────────────────────────────────────────────
create table if not exists patients (
  id            text primary key,
  name          text not null,
  age           integer not null,
  condition     text not null,
  last_visit    date,
  next_appointment date,
  risk_level    text check (risk_level in ('critical','high','medium','low')) not null,
  risk_score    integer check (risk_score between 0 and 100) not null,
  missed_appointments integer default 0,
  medications   text[] default '{}',
  bp            text,
  hr            integer,
  temp          numeric(4,1),
  spo2          integer,
  ai_summary    text,
  alerts        text[] default '{}',
  trend         text check (trend in ('improving','stable','declining')) not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Workflow Tasks ─────────────────────────────────────────────────────────
create table if not exists workflow_tasks (
  id            text primary key,
  type          text check (type in ('follow-up','lab-order','referral','alert')) not null,
  patient_name  text not null,
  patient_id    text references patients(id) on delete cascade,
  priority      text check (priority in ('urgent','normal','low')) not null,
  description   text not null,
  ai_generated  boolean default false,
  completed     boolean default false,
  created_at    timestamptz default now()
);

-- ── Chat History ───────────────────────────────────────────────────────────
create table if not exists chat_history (
  id            uuid primary key default gen_random_uuid(),
  patient_id    text references patients(id) on delete cascade,
  role          text check (role in ('user','assistant')) not null,
  content       text not null,
  created_at    timestamptz default now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_chat_patient on chat_history(patient_id, created_at desc);
create index if not exists idx_tasks_patient on workflow_tasks(patient_id);
create index if not exists idx_patients_risk on patients(risk_score desc);

-- ── Seed Data ──────────────────────────────────────────────────────────────
insert into patients values
('P001','Nasim Ansari',67,'Type 2 Diabetes + Hypertension','2026-04-10','2026-05-02','critical',87,3,
 ARRAY['Metformin 1000mg','Lisinopril 10mg','Atorvastatin 20mg'],
 '158/96',92,37.2,96,
 'Patient shows escalating BP trend over 3 visits. Missed 3 consecutive follow-ups. HbA1c last recorded at 9.2% — significantly above target. High risk of cardiovascular event within 90 days.',
 ARRAY['BP above threshold for 3 visits','HbA1c uncontrolled','3 missed appointments'],
 'declining',now(),now()),
('P002','Kapil Shah',34,'Gestational Diabetes','2026-04-22','2026-04-30','high',71,1,
 ARRAY['Insulin Aspart','Folic Acid 5mg'],
 '130/85',88,36.8,98,
 '28-week pregnancy with gestational diabetes. Blood glucose trending upward. Fetal growth scan overdue by 2 weeks.',
 ARRAY['Fetal scan overdue','Glucose trending up'],
 'stable',now(),now()),
('P003','Shivam Jaiswal',52,'Post-MI Recovery','2026-04-18','2026-05-05','high',68,0,
 ARRAY['Aspirin 100mg','Clopidogrel 75mg','Bisoprolol 5mg','Ramipril 5mg'],
 '125/80',72,36.6,97,
 '6 weeks post-MI. Adherent to medication. Ejection fraction improved from 35% to 42% since discharge.',
 ARRAY['Cardiac rehab follow-up due'],
 'improving',now(),now()),
('P004','Aashish Jaiswal',45,'Chronic Kidney Disease Stage 3','2026-03-30',null,'medium',54,2,
 ARRAY['Amlodipine 5mg','Erythropoietin'],
 '140/88',78,36.9,97,
 'CKD Stage 3 with no appointment scheduled. eGFR last recorded at 42 — borderline for Stage 4 progression.',
 ARRAY['No appointment scheduled','eGFR borderline'],
 'stable',now(),now()),
('P005','Prashant Jha',28,'Asthma','2026-04-25','2026-06-01','low',22,0,
 ARRAY['Salbutamol inhaler','Fluticasone 100mcg'],
 '118/74',68,36.5,99,
 'Well-controlled asthma. No exacerbations in 6 months. Continue current management.',
 ARRAY[]::text[],
 'improving',now(),now()),
('P006','Rahul Yadav',28,'HIV/AIDS','2026-04-20','2026-05-15','high',65,1,
 ARRAY['Tenofovir 300mg','Emtricitabine 200mg','Efavirenz 600mg'],
 '122/78',74,36.7,98,
 'HIV-positive on ART for 2 years. Viral load undetectable at last check. CD4 count 520. One missed appointment. Adherence counseling recommended.',
 ARRAY['Missed last follow-up','CD4 recheck due'],
 'stable',now(),now())
on conflict (id) do nothing;

insert into workflow_tasks values
('T001','alert','Nasim Ansari','P001','urgent','Send urgent re-engagement — 3 missed appointments + critical BP',true,false,now()),
('T002','lab-order','Kapil Shah','P002','urgent','Order fetal growth scan — overdue by 2 weeks',true,false,now()),
('T003','follow-up','Aashish Jaiswal','P004','urgent','Schedule CKD follow-up — no appointment on record',true,false,now()),
('T004','referral','Shivam Jaiswal','P003','normal','Refer to cardiac rehab for final 4 sessions',false,false,now()),
('T005','follow-up','Rahul Yadav','P006','normal','ART adherence counseling + CD4 recheck',true,false,now())
on conflict (id) do nothing;
