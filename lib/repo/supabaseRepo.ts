import { supabase } from '../supabase';
import type { Repo, NewTask } from './index';
import type { OrgStudent, Profile, Session, UserRole, Verification, VerifyStatus } from '../types';

// Supabase-backed repo. RLS does the real enforcement server-side; queries here
// stay narrow so they work under deny-by-default policies.

async function sessionFromAuth(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) return null;
  return {
    userId: user.id,
    email: user.email ?? '',
    role: profile.role as UserRole,
    displayName: profile.display_name,
    handle: profile.handle,
  };
}

function throwIf(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export const supabaseRepo: Repo = {
  async signUp(email, password, role, displayName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, display_name: displayName } }, // consumed by handle_new_user()
    });
    throwIf(error);
    const s = await sessionFromAuth();
    if (!s) throw new Error('Check your email to confirm your account, then sign in.');
    return s;
  },

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    throwIf(error);
    const s = await sessionFromAuth();
    if (!s) throw new Error('Could not load your profile.');
    return s;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  getSession: sessionFromAuth,

  async updateProfile(userId, patch) {
    const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
    throwIf(error);
  },

  async listRecipients(teenId) {
    const { data, error } = await supabase.from('care_recipients').select('*').eq('teen_id', teenId);
    throwIf(error);
    return data ?? [];
  },

  async addRecipient(teenId, alias, relationship) {
    const { data, error } = await supabase
      .from('care_recipients')
      .insert({ teen_id: teenId, alias, relationship })
      .select()
      .single();
    throwIf(error);
    return data;
  },

  async deleteRecipient(id) {
    throwIf((await supabase.from('care_recipients').delete().eq('id', id)).error);
  },

  async listTasks(teenId) {
    const { data, error } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('teen_id', teenId)
      .eq('active', true)
      .order('next_due', { ascending: true, nullsFirst: false });
    throwIf(error);
    return data ?? [];
  },

  async upsertTask(teenId, task: NewTask) {
    const row = { ...task, teen_id: teenId };
    const { data, error } = await supabase.from('care_tasks').upsert(row).select().single();
    throwIf(error);
    return data;
  },

  async deleteTask(id) {
    throwIf((await supabase.from('care_tasks').delete().eq('id', id)).error);
  },

  async completeTask(task, minutes, nextDue) {
    throwIf(
      (await supabase.from('task_logs').insert({ task_id: task.id, teen_id: task.teen_id, minutes })).error,
    );
    const patch = nextDue ? { next_due: nextDue } : { active: false };
    const { data, error } = await supabase.from('care_tasks').update(patch).eq('id', task.id).select().single();
    throwIf(error);
    return data;
  },

  async listLogs(teenId, sinceIso) {
    const { data, error } = await supabase
      .from('task_logs')
      .select('*')
      .eq('teen_id', teenId)
      .gte('completed_at', sinceIso);
    throwIf(error);
    return data ?? [];
  },

  async listOrganizations() {
    const { data, error } = await supabase.from('organizations').select('*').order('name');
    throwIf(error);
    return data ?? [];
  },

  async myVerifications(teenId) {
    const { data, error } = await supabase
      .from('caregiver_verifications')
      .select('*, org:organizations(*)')
      .eq('teen_id', teenId);
    throwIf(error);
    return (data ?? []) as Verification[];
  },

  async requestVerification(teenId, orgId) {
    throwIf((await supabase.from('caregiver_verifications').insert({ teen_id: teenId, org_id: orgId })).error);
  },

  async setConsent(verificationId, consent) {
    throwIf(
      (await supabase.from('caregiver_verifications').update({ consent_granted: consent }).eq('id', verificationId)).error,
    );
  },

  async revokeVerification(verificationId) {
    return supabaseRepo.setConsent(verificationId, false);
  },

  async orgForMember(profileId) {
    const { data, error } = await supabase
      .from('org_members')
      .select('org:organizations(*)')
      .eq('profile_id', profileId)
      .limit(1);
    throwIf(error);
    return (data?.[0]?.org as never) ?? null;
  },

  async createOrgAndJoin(profileId, name, kind, district) {
    const { data: org, error } = await supabase
      .from('organizations')
      .insert({ name, kind, district })
      .select()
      .single();
    throwIf(error);
    throwIf((await supabase.from('org_members').insert({ org_id: org.id, profile_id: profileId, org_role: 'admin' })).error);
    return org;
  },

  async orgRequests(orgId) {
    const { data, error } = await supabase
      .from('caregiver_verifications')
      .select('*, teen:profiles!caregiver_verifications_teen_id_fkey(*)')
      .eq('org_id', orgId)
      .eq('status', 'pending');
    throwIf(error);
    return (data ?? []) as (Verification & { teen: Profile })[];
  },

  async decideVerification(verificationId, status: VerifyStatus) {
    throwIf(
      (await supabase
        .from('caregiver_verifications')
        .update({ status, decided_at: new Date().toISOString() })
        .eq('id', verificationId)).error,
    );
  },

  async orgStudents(orgId) {
    // RLS only exposes consented teens' profiles/tasks/logs to org members.
    const { data: vers, error } = await supabase
      .from('caregiver_verifications')
      .select('*, teen:profiles!caregiver_verifications_teen_id_fkey(*)')
      .eq('org_id', orgId)
      .eq('status', 'verified')
      .eq('consent_granted', true);
    throwIf(error);
    const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
    const out: OrgStudent[] = [];
    for (const v of (vers ?? []) as (Verification & { teen: Profile })[]) {
      const [{ count: taskCount }, { data: logs }] = await Promise.all([
        supabase.from('care_tasks').select('*', { count: 'exact', head: true }).eq('teen_id', v.teen_id).eq('active', true),
        supabase.from('task_logs').select('minutes').eq('teen_id', v.teen_id).gte('completed_at', weekAgo),
      ]);
      out.push({
        profile: v.teen,
        verification: v,
        activeTasks: taskCount ?? 0,
        minutesThisWeek: (logs ?? []).reduce((s, l) => s + (l.minutes ?? 0), 0),
      });
    }
    return out;
  },

  async listResources() {
    const { data, error } = await supabase.from('resources').select('*').order('title');
    throwIf(error);
    return data ?? [];
  },

  async upsertResource(orgId, r) {
    const { data, error } = await supabase
      .from('resources')
      .upsert({ ...r, org_id: orgId })
      .select()
      .single();
    throwIf(error);
    return data;
  },

  async deleteResource(id) {
    throwIf((await supabase.from('resources').delete().eq('id', id)).error);
  },

  async myShares(teenId) {
    const { data, error } = await supabase.from('resource_shares').select('*').eq('teen_id', teenId);
    throwIf(error);
    return data ?? [];
  },

  async toggleSaveResource(teenId, resourceId) {
    const { data } = await supabase
      .from('resource_shares')
      .select('*')
      .eq('teen_id', teenId)
      .eq('resource_id', resourceId)
      .is('shared_by_org', null)
      .limit(1);
    const existing = data?.[0];
    if (existing) {
      throwIf((await supabase.from('resource_shares').update({ saved: !existing.saved }).eq('id', existing.id)).error);
    } else {
      throwIf((await supabase.from('resource_shares').insert({ teen_id: teenId, resource_id: resourceId, saved: true })).error);
    }
  },

  async shareResourceToTeen(orgId, teenId, resourceId) {
    throwIf(
      (await supabase
        .from('resource_shares')
        .insert({ teen_id: teenId, resource_id: resourceId, shared_by_org: orgId })).error,
    );
  },
};
