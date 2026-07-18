-- Keel RLS — deny by default (RLS on = no access until a policy grants it), then grant narrowly.
alter table profiles                enable row level security;
alter table care_recipients         enable row level security;
alter table care_tasks              enable row level security;
alter table task_logs               enable row level security;
alter table caregiver_verifications enable row level security;
alter table resources               enable row level security;
alter table resource_shares         enable row level security;
alter table organizations           enable row level security;
alter table org_members             enable row level security;

-- profiles: you see/edit your own
create policy "own profile" on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

-- profiles: org members may read the profile of a teen who is verified AND consented with their org
create policy "org reads consented teen profile" on profiles for select
  using (exists (
    select 1 from caregiver_verifications v
    join org_members m on m.org_id = v.org_id
    where v.teen_id = profiles.id
      and m.profile_id = auth.uid()
      and v.status = 'verified' and v.consent_granted = true));

-- organizations: readable by any signed-in user (teens must browse orgs to request verification);
-- writes restricted to members creating/updating their own org
create policy "read organizations" on organizations for select
  using (auth.uid() is not null);
create policy "create organization" on organizations for insert
  with check (auth.uid() is not null);
create policy "org members update own org" on organizations for update
  using (id in (select org_id from org_members where profile_id = auth.uid()));

-- org_members: you see and manage your own memberships
create policy "own memberships" on org_members for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- teen-owned tables: teen owns their rows
create policy "teen owns recipients" on care_recipients for all
  using (teen_id = auth.uid()) with check (teen_id = auth.uid());
create policy "teen owns tasks" on care_tasks for all
  using (teen_id = auth.uid()) with check (teen_id = auth.uid());
create policy "teen owns logs" on task_logs for all
  using (teen_id = auth.uid()) with check (teen_id = auth.uid());

-- verifications: teen sees own; org members see/decide requests to their org
create policy "teen sees own verifications" on caregiver_verifications for all
  using (teen_id = auth.uid()) with check (teen_id = auth.uid());
create policy "org sees its verifications" on caregiver_verifications for select
  using (org_id in (select org_id from org_members where profile_id = auth.uid()));
create policy "org decides its verifications" on caregiver_verifications for update
  using (org_id in (select org_id from org_members where profile_id = auth.uid()));

-- CONSENT GATE: an org may read a consenting teen's care data
create policy "org reads consented teen tasks" on care_tasks for select
  using (exists (
    select 1 from caregiver_verifications v
    join org_members m on m.org_id = v.org_id
    where v.teen_id = care_tasks.teen_id
      and m.profile_id = auth.uid()
      and v.status = 'verified' and v.consent_granted = true));
create policy "org reads consented teen logs" on task_logs for select
  using (exists (
    select 1 from caregiver_verifications v
    join org_members m on m.org_id = v.org_id
    where v.teen_id = task_logs.teen_id
      and m.profile_id = auth.uid()
      and v.status = 'verified' and v.consent_granted = true));

-- resources: public-catalog readable; writes locked to the owning org's members
create policy "read resources" on resources for select
  using (true);
create policy "org writes resources" on resources for insert
  with check (org_id in (select org_id from org_members where profile_id = auth.uid()));
create policy "org updates own resources" on resources for update
  using (org_id in (select org_id from org_members where profile_id = auth.uid()));
create policy "org deletes own resources" on resources for delete
  using (org_id in (select org_id from org_members where profile_id = auth.uid()));

-- shares: teen owns their shares; an org member may push a share to a consented teen
create policy "teen sees own shares" on resource_shares for all
  using (teen_id = auth.uid()) with check (teen_id = auth.uid());
create policy "org shares to consented teen" on resource_shares for insert
  with check (exists (
    select 1 from caregiver_verifications v
    join org_members m on m.org_id = v.org_id
    where v.teen_id = resource_shares.teen_id
      and m.profile_id = auth.uid()
      and v.status = 'verified' and v.consent_granted = true));
