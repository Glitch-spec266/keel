-- Keel demo seed — ALL DATA IS OBVIOUSLY FAKE. No real PHI, names, or contact info.
-- Orgs
insert into organizations (id, name, kind, district, verified) values
  ('00000000-0000-4000-a000-000000000001', 'Sample High School (Demo)', 'school',    'CA-18', true),
  ('00000000-0000-4000-a000-000000000002', 'Youth Caregiver Alliance (Demo)', 'nonprofit', 'CA-18', true);

-- Global resources (~8, across categories; org_id null = global catalog)
insert into resources (title, category, description, url, location, district) values
  ('Respite Care Weekend Program (Demo)', 'respite',       'Trained volunteers sit with your family member for a few hours so you can rest or study.', 'https://example.org/respite', 'Sampleville Community Center', 'CA-18'),
  ('Free Family Meal Boxes (Demo)',       'food',          'Weekly grocery boxes for households where a student is the primary caregiver.',            'https://example.org/meals',   'Sampleville Food Bank',        'CA-18'),
  ('Teen Caregiver Support Circle (Demo)','mental_health', 'A weekly peer group led by a counselor, just for student caregivers. Anonymous handles welcome.', 'https://example.org/circle', 'Online',              null),
  ('Crisis Text Line',                    'mental_health', 'Text HOME to 741741 to reach a volunteer crisis counselor, free, 24/7.',                   'https://www.crisistextline.org', 'Nationwide',          null),
  ('Know Your Rights: School Absences (Demo)', 'legal',    'Plain-language guide to attendance protections when caregiving makes you miss class.',    'https://example.org/rights',  'Online',               null),
  ('Emergency Utility Bill Fund (Demo)',  'financial',     'One-time grants that keep the lights on when a family income drops due to illness.',      'https://example.org/fund',    'Sampleville',          'CA-18'),
  ('Safe Medication Handling 101 (Demo)', 'training',      'A 30-minute video course on giving medications safely, made for untrained family caregivers.', 'https://example.org/meds101', 'Online',          null),
  ('After-School Homework Cover (Demo)',  'respite',       'Volunteers cover a 2-hour afternoon shift twice a week so you can finish homework.',      'https://example.org/homework', 'Sample High School',  'CA-18');

-- NOTE: demo *users* (a teen + an org member) must be created through Supabase Auth
-- (auth.users cannot be seeded with plain SQL inserts safely). Use the app's sign-up
-- flow or `supabase auth` admin API with obviously fake accounts, e.g.:
--   teen: demo.teen@example.com  (display "Sam (Demo Teen)", recipient alias "Grandma R.")
--   org:  demo.counselor@example.com (member of Sample High School)
-- The app seeds "Grandma R." demo tasks on first run in demo mode instead.
