import { isSupabaseConfigured } from '../supabase';
import type {
  CareRecipient, CareTask, Organization, OrgStudent, Profile, Resource,
  ResourceShare, Session, TaskLog, TaskKind, UserRole, Verification, VerifyStatus,
} from '../types';

export type NewTask = {
  id?: string;
  recipient_id: string | null;
  kind: TaskKind;
  title: string;
  dose: string | null;
  rrule: string | null;
  next_due: string | null;
  notify_minutes_before: number;
  active?: boolean;
};

export interface Repo {
  // auth/session
  signUp(email: string, password: string, role: UserRole, displayName: string): Promise<Session>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
  updateProfile(userId: string, patch: Partial<Pick<Profile, 'display_name' | 'locale'>>): Promise<void>;

  // recipients
  listRecipients(teenId: string): Promise<CareRecipient[]>;
  addRecipient(teenId: string, alias: string, relationship: string | null): Promise<CareRecipient>;
  deleteRecipient(id: string): Promise<void>;

  // tasks + logs (Pillar 1)
  listTasks(teenId: string): Promise<CareTask[]>;
  upsertTask(teenId: string, task: NewTask): Promise<CareTask>;
  deleteTask(id: string): Promise<void>;
  completeTask(task: CareTask, minutes: number | null, nextDue: string | null): Promise<CareTask>;
  listLogs(teenId: string, sinceIso: string): Promise<TaskLog[]>;

  // orgs + verification (Pillar 2)
  listOrganizations(): Promise<Organization[]>;
  myVerifications(teenId: string): Promise<Verification[]>;
  requestVerification(teenId: string, orgId: string): Promise<void>;
  setConsent(verificationId: string, consent: boolean): Promise<void>;
  revokeVerification(verificationId: string): Promise<void>;
  orgForMember(profileId: string): Promise<Organization | null>;
  createOrgAndJoin(profileId: string, name: string, kind: Organization['kind'], district: string | null): Promise<Organization>;
  orgRequests(orgId: string): Promise<(Verification & { teen: Profile })[]>;
  decideVerification(verificationId: string, status: VerifyStatus): Promise<void>;
  orgStudents(orgId: string): Promise<OrgStudent[]>;

  // resources
  listResources(): Promise<Resource[]>;
  upsertResource(orgId: string, r: Omit<Resource, 'id' | 'org_id'> & { id?: string }): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
  myShares(teenId: string): Promise<ResourceShare[]>;
  toggleSaveResource(teenId: string, resourceId: string): Promise<void>;
  shareResourceToTeen(orgId: string, teenId: string, resourceId: string): Promise<void>;
}

// Demo mode (no Supabase keys) uses the on-device repo so the whole app is drivable
// with fake data; with keys present, the Supabase repo takes over unchanged.
import { localRepo } from './local';
import { supabaseRepo } from './supabaseRepo';

export const repo: Repo = isSupabaseConfigured ? supabaseRepo : localRepo;
export const isDemoMode = !isSupabaseConfigured;
