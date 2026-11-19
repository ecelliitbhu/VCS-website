-- Migration: per-year cohort schema (replaces signup_version / registrations / course_weeks / scores)
--
-- Non-destructive: the old tables (registrations, scores, course_weeks) and
-- users.signup_version are NOT touched, so last year's data stays queryable.
-- Run in the Supabase SQL editor. Review the seed values at the bottom first.
--
-- AFTER running: Supabase Dashboard -> Project Settings -> API -> "Exposed schemas"
-- -> add vcs_2026_schema (otherwise the API cannot see it).
--
-- IMPORTANT: RLS is enabled on the new tables with no policies, so only the
-- service-role key can read/write them. Set SUPABASE_SERVICE_ROLE_KEY in the
-- environment (server only, never NEXT_PUBLIC_) BEFORE deploying the new code.

BEGIN;

CREATE SCHEMA IF NOT EXISTS vcs_2026_schema;

-- 1. Cohorts: one row per year/edition ------------------------------------
CREATE TABLE IF NOT EXISTS vcs_2026_schema.cohorts (
  id                text PRIMARY KEY,               -- e.g. 'vcs-2026'
  year              int  NOT NULL,
  name              text NOT NULL,
  registration_open boolean NOT NULL DEFAULT false, -- replaces REGISTRATION_OPEN constant
  is_active         boolean NOT NULL DEFAULT false, -- exactly one active cohort
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS cohorts_one_active ON vcs_2026_schema.cohorts (is_active) WHERE is_active;

-- 2. Enrollments: a user's signup for ONE cohort (+ profile snapshot) -----
CREATE TABLE IF NOT EXISTS vcs_2026_schema.enrollments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id    text NOT NULL REFERENCES vcs_2026_schema.cohorts(id) ON DELETE CASCADE,
  user_email   text NOT NULL,
  track        text CHECK (track IN ('basic', 'advanced')),
  full_name    text NOT NULL,
  institution  text NOT NULL,
  current_year text NOT NULL,
  course       text NOT NULL,
  branch       text NOT NULL,
  phone_number text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, user_email)
);
CREATE INDEX IF NOT EXISTS enrollments_email_idx ON vcs_2026_schema.enrollments (user_email);

-- 3. Assessments: things that can be scored (replaces course_weeks + hardcoded
--    quiz links, max scores and the fake week 99) ---------------------------
CREATE TABLE IF NOT EXISTS vcs_2026_schema.assessments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id  text NOT NULL REFERENCES vcs_2026_schema.cohorts(id) ON DELETE CASCADE,
  key        text NOT NULL,                  -- stable id used in score uploads, e.g. 'm3-assignment'
  module     int,                            -- 1..4, null for hackathon
  kind       text NOT NULL CHECK (kind IN ('quiz', 'assignment', 'hackathon')),
  title      text NOT NULL,
  max_score  numeric NOT NULL,
  weight     numeric,                        -- share of final grade (decide + fill in)
  track      text CHECK (track IN ('basic', 'advanced')), -- null = everyone
  url        text,                           -- Google Form / submission link
  due_date   timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (cohort_id, key)
);

-- 4. Scores: one per (enrollment, assessment) -----------------------------
CREATE TABLE IF NOT EXISTS vcs_2026_schema.assessment_scores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES vcs_2026_schema.enrollments(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES vcs_2026_schema.assessments(id) ON DELETE CASCADE,
  score         numeric,
  graded_by     text,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, assessment_id)
);

ALTER TABLE vcs_2026_schema.cohorts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vcs_2026_schema.enrollments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vcs_2026_schema.assessments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vcs_2026_schema.assessment_scores ENABLE ROW LEVEL SECURITY;

-- Let the API's service_role use the schema (RLS stays on; no public/anon access)
GRANT USAGE ON SCHEMA vcs_2026_schema TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA vcs_2026_schema TO service_role;

-- 5. Seed the 2026 cohort ---------------------------------------------------
-- PLACEHOLDERS: confirm max_score / weight / urls with the course team.
INSERT INTO vcs_2026_schema.cohorts (id, year, name, registration_open, is_active)
VALUES ('vcs-2026', 2026, 'VC Scout 2026', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vcs_2026_schema.assessments (cohort_id, key, module, kind, title, max_score, weight, track, sort_order) VALUES
  ('vcs-2026', 'm1-quiz',       1, 'quiz',       'Module 1 Quiz',                       10,  NULL, NULL, 10),
  ('vcs-2026', 'm2-assignment', 2, 'assignment', 'Module 2 Assignment: Deal Pipeline', 100,  NULL, NULL, 20),
  ('vcs-2026', 'm3-quiz',       3, 'quiz',       'Module 3 Quiz: Valuation & Dilution', 10,  NULL, NULL, 30),
  ('vcs-2026', 'm3-assignment', 3, 'assignment', 'Module 3 Assignment: Investment Memo',100,  NULL, NULL, 31),
  ('vcs-2026', 'm4-assignment', 4, 'assignment', 'Module 4: Demo Day Analyst Pack',    100,  NULL, NULL, 40),
  ('vcs-2026', 'hackathon',  NULL, 'hackathon',  'Final Hackathon',                    100,  NULL, NULL, 50)
ON CONFLICT (cohort_id, key) DO NOTHING;

COMMIT;

-- Optional: carry 2025 registrations over as a closed archive cohort.
-- INSERT INTO vcs_2026_schema.cohorts (id, year, name) VALUES ('vcs-2025', 2025, 'VC Scout 2025');
--
-- Rollback (manual):
-- DROP SCHEMA IF EXISTS vcs_2026_schema CASCADE;
