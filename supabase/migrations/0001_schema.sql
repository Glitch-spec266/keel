-- Keel schema — roles, care data, verification/consent, resources
create type user_role as enum ('teen','org');
create type verify_status as enum ('pending','verified','declined');
create type task_kind as enum ('medication','appointment','task');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'teen',
  display_name text,
  handle text unique,                 -- anonymous handle for any peer-facing surface
  age_band text,                      -- e.g. '13-15','16-18' (avoid storing exact DOB)
  locale text default 'en',
  created_at timestamptz default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null,                 -- 'school' | 'nonprofit' | 'clinic'
  district text,                      -- ties into the "Congressional district" civic angle
  verified boolean default false,
  created_at timestamptz default now()
);

create table org_members (
  org_id uuid references organizations on delete cascade,
  profile_id uuid references profiles on delete cascade,
  org_role text default 'member',
  primary key (org_id, profile_id)
);

-- who the teen cares for
create table care_recipients (
  id uuid primary key default gen_random_uuid(),
  teen_id uuid not null references profiles on delete cascade,
  alias text not null,                -- "Grandma R." — never require legal name
  relationship text,
  conditions text[],                  -- controlled vocab
  notes text,
  created_at timestamptz default now()
);

-- PILLAR 1: care scheduler + reminders
create table care_tasks (
  id uuid primary key default gen_random_uuid(),
  teen_id uuid not null references profiles on delete cascade,
  recipient_id uuid references care_recipients on delete cascade,
  kind task_kind not null default 'task',
  title text not null,
  dose text,                          -- for medication
  rrule text,                         -- recurrence (RFC5545 via rrule lib)
  next_due timestamptz,
  notify_minutes_before int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table task_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references care_tasks on delete cascade,
  teen_id uuid not null references profiles on delete cascade,
  completed_at timestamptz default now(),
  minutes int,                        -- feeds the impact/hours tracker
  note text
);

-- PILLAR 2: org verification + resource unlock
create table caregiver_verifications (
  id uuid primary key default gen_random_uuid(),
  teen_id uuid not null references profiles on delete cascade,
  org_id uuid not null references organizations on delete cascade,
  status verify_status not null default 'pending',
  consent_granted boolean not null default false,  -- teen must opt in for org visibility
  requested_at timestamptz default now(),
  decided_at timestamptz,
  unique (teen_id, org_id)
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations on delete set null, -- null = global resource
  title text not null,
  category text not null,             -- 'respite','food','mental_health','legal','financial','training'
  description text,
  url text,
  location text,
  district text
);

create table resource_shares (
  id uuid primary key default gen_random_uuid(),
  teen_id uuid not null references profiles on delete cascade,
  resource_id uuid not null references resources on delete cascade,
  shared_by_org uuid references organizations on delete set null,
  shared_at timestamptz default now(),
  saved boolean default false
);
