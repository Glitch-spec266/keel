import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Repo, NewTask } from './index';
import type {
  CareRecipient, CareTask, Organization, OrgStudent, Profile, Resource,
  ResourceShare, Session, TaskLog, UserRole, Verification, VerifyStatus,
} from '../types';

// On-device demo repo. ALL DATA IS FAKE ("Grandma R.", example.com accounts).
// Passwords are stored in plain text on purpose: this store only exists in demo
// mode with fabricated accounts; real auth goes through Supabase.

type LocalUser = { id: string; email: string; password: string; profile: Profile };

type DB = {
  users: LocalUser[];
  sessionUserId: string | null;
  recipients: CareRecipient[];
  tasks: CareTask[];
  logs: TaskLog[];
  orgs: Organization[];
  members: { org_id: string; profile_id: string }[];
  verifications: Verification[];
  resources: Resource[];
  shares: ResourceShare[];
};

const KEY = 'keel-demo-db-v1';

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const ORG_SCHOOL = '00000000-0000-4000-a000-000000000001';
const ORG_NPO = '00000000-0000-4000-a000-000000000002';
const TEEN_ID = '00000000-0000-4000-b000-000000000001';
const COUNSELOR_ID = '00000000-0000-4000-b000-000000000002';

function todayAt(h: number, m = 0): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

function seed(): DB {
  const recipientId = uid();
  return {
    users: [
      {
        id: TEEN_ID, email: 'demo.teen@example.com', password: 'demo1234',
        profile: { id: TEEN_ID, role: 'teen', display_name: 'Sam (Demo)', handle: 'keel-sample1', age_band: '16-18', locale: 'en' },
      },
      {
        id: COUNSELOR_ID, email: 'demo.counselor@example.com', password: 'demo1234',
        profile: { id: COUNSELOR_ID, role: 'org', display_name: 'Counselor Demo', handle: 'keel-sample2', age_band: null, locale: 'en' },
      },
    ],
    sessionUserId: null,
    recipients: [
      { id: recipientId, teen_id: TEEN_ID, alias: 'Grandma R.', relationship: 'Grandmother', conditions: ['diabetes'], notes: null },
    ],
    tasks: [
      {
        id: uid(), teen_id: TEEN_ID, recipient_id: recipientId, kind: 'medication',
        title: 'Evening insulin', dose: '10 units', rrule: 'FREQ=DAILY',
        next_due: todayAt(18), notify_minutes_before: 10, active: true,
      },
      {
        id: uid(), teen_id: TEEN_ID, recipient_id: recipientId, kind: 'task',
        title: 'Check blood sugar log', dose: null, rrule: 'FREQ=DAILY',
        next_due: todayAt(20), notify_minutes_before: 0, active: true,
      },
    ],
    logs: [],
    orgs: [
      { id: ORG_SCHOOL, name: 'Sample High School (Demo)', kind: 'school', district: 'CA-18', verified: true },
      { id: ORG_NPO, name: 'Youth Caregiver Alliance (Demo)', kind: 'nonprofit', district: 'CA-18', verified: true },
    ],
    members: [{ org_id: ORG_SCHOOL, profile_id: COUNSELOR_ID }],
    verifications: [],
    resources: [
      { id: uid(), org_id: null, title: 'Respite Care Weekend Program (Demo)', category: 'respite', description: 'Trained volunteers sit with your family member for a few hours so you can rest or study.', url: 'https://example.org/respite', location: 'Sampleville Community Center', district: 'CA-18' },
      { id: uid(), org_id: null, title: 'Free Family Meal Boxes (Demo)', category: 'food', description: 'Weekly grocery boxes for households where a student is the primary caregiver.', url: 'https://example.org/meals', location: 'Sampleville Food Bank', district: 'CA-18' },
      { id: uid(), org_id: null, title: 'Teen Caregiver Support Circle (Demo)', category: 'mental_health', description: 'A weekly peer group led by a counselor, just for student caregivers. Anonymous handles welcome.', url: 'https://example.org/circle', location: 'Online', district: null },
      { id: uid(), org_id: null, title: 'Crisis Text Line', category: 'mental_health', description: 'Text HOME to 741741 to reach a volunteer crisis counselor, free, 24/7.', url: 'https://www.crisistextline.org', location: 'Nationwide', district: null },
      { id: uid(), org_id: null, title: 'Know Your Rights: School Absences (Demo)', category: 'legal', description: 'Plain-language guide to attendance protections when caregiving makes you miss class.', url: 'https://example.org/rights', location: 'Online', district: null },
      { id: uid(), org_id: null, title: 'Emergency Utility Bill Fund (Demo)', category: 'financial', description: 'One-time grants that keep the lights on when a family income drops due to illness.', url: 'https://example.org/fund', location: 'Sampleville', district: 'CA-18' },
      { id: uid(), org_id: null, title: 'Safe Medication Handling 101 (Demo)', category: 'training', description: 'A 30-minute video course on giving medications safely, made for untrained family caregivers.', url: 'https://example.org/meds101', location: 'Online', district: null },
      { id: uid(), org_id: ORG_SCHOOL, title: 'After-School Homework Cover (Demo)', category: 'respite', description: 'Volunteers cover a 2-hour afternoon shift twice a week so you can finish homework.', url: 'https://example.org/homework', location: 'Sample High School', district: 'CA-18' },
    ],
    shares: [],
  };
}

let db: DB | null = null;
let loading: Promise<DB> | null = null;

async function load(): Promise<DB> {
  if (db) return db;
  if (!loading) {
    loading = (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        db = raw ? (JSON.parse(raw) as DB) : seed();
      } catch {
        db = seed();
      }
      return db;
    })();
  }
  return loading;
}

async function save(): Promise<void> {
  if (db) await AsyncStorage.setItem(KEY, JSON.stringify(db));
}

function toSession(u: LocalUser): Session {
  return { userId: u.id, email: u.email, role: u.profile.role, displayName: u.profile.display_name, handle: u.profile.handle };
}

function consentedTeenIds(d: DB, orgId: string): string[] {
  return d.verifications
    .filter((v) => v.org_id === orgId && v.status === 'verified' && v.consent_granted)
    .map((v) => v.teen_id);
}

export const localRepo: Repo = {
  async signUp(email, password, role: UserRole, displayName) {
    const d = await load();
    if (d.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const id = uid();
    const user: LocalUser = {
      id, email, password,
      profile: { id, role, display_name: displayName, handle: `keel-${id.slice(0, 8)}`, age_band: null, locale: 'en' },
    };
    d.users.push(user);
    d.sessionUserId = id;
    await save();
    return toSession(user);
  },

  async signIn(email, password) {
    const d = await load();
    const user = d.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('Wrong email or password.');
    d.sessionUserId = user.id;
    await save();
    return toSession(user);
  },

  async signOut() {
    const d = await load();
    d.sessionUserId = null;
    await save();
  },

  async getSession() {
    const d = await load();
    const user = d.users.find((u) => u.id === d.sessionUserId);
    return user ? toSession(user) : null;
  },

  async updateProfile(userId, patch) {
    const d = await load();
    const user = d.users.find((u) => u.id === userId);
    if (user) Object.assign(user.profile, patch);
    await save();
  },

  async listRecipients(teenId) {
    const d = await load();
    return d.recipients.filter((r) => r.teen_id === teenId);
  },

  async addRecipient(teenId, alias, relationship) {
    const d = await load();
    const rec: CareRecipient = { id: uid(), teen_id: teenId, alias, relationship, conditions: [], notes: null };
    d.recipients.push(rec);
    await save();
    return rec;
  },

  async deleteRecipient(id) {
    const d = await load();
    d.recipients = d.recipients.filter((r) => r.id !== id);
    d.tasks = d.tasks.filter((t) => t.recipient_id !== id);
    await save();
  },

  async listTasks(teenId) {
    const d = await load();
    return d.tasks
      .filter((t) => t.teen_id === teenId && t.active)
      .sort((a, b) => (a.next_due ?? '9999').localeCompare(b.next_due ?? '9999'));
  },

  async upsertTask(teenId, task: NewTask) {
    const d = await load();
    if (task.id) {
      const existing = d.tasks.find((t) => t.id === task.id && t.teen_id === teenId);
      if (!existing) throw new Error('Task not found');
      Object.assign(existing, task);
      await save();
      return existing;
    }
    const created: CareTask = { active: true, ...task, id: uid(), teen_id: teenId } as CareTask;
    d.tasks.push(created);
    await save();
    return created;
  },

  async deleteTask(id) {
    const d = await load();
    d.tasks = d.tasks.filter((t) => t.id !== id);
    d.logs = d.logs.filter((l) => l.task_id !== id);
    await save();
  },

  async completeTask(task, minutes, nextDue) {
    const d = await load();
    d.logs.push({ id: uid(), task_id: task.id, teen_id: task.teen_id, completed_at: new Date().toISOString(), minutes, note: null });
    const t = d.tasks.find((x) => x.id === task.id);
    if (t) {
      if (nextDue) t.next_due = nextDue;
      else t.active = false; // one-off tasks retire once done
    }
    await save();
    return t ?? task;
  },

  async listLogs(teenId, sinceIso) {
    const d = await load();
    return d.logs.filter((l) => l.teen_id === teenId && l.completed_at >= sinceIso);
  },

  async listOrganizations() {
    const d = await load();
    return d.orgs;
  },

  async myVerifications(teenId) {
    const d = await load();
    return d.verifications
      .filter((v) => v.teen_id === teenId)
      .map((v) => ({ ...v, org: d.orgs.find((o) => o.id === v.org_id) }));
  },

  async requestVerification(teenId, orgId) {
    const d = await load();
    if (d.verifications.some((v) => v.teen_id === teenId && v.org_id === orgId)) return;
    d.verifications.push({
      id: uid(), teen_id: teenId, org_id: orgId, status: 'pending',
      consent_granted: false, requested_at: new Date().toISOString(), decided_at: null,
    });
    await save();
  },

  async setConsent(verificationId, consent) {
    const d = await load();
    const v = d.verifications.find((x) => x.id === verificationId);
    if (v) v.consent_granted = consent;
    await save();
  },

  async revokeVerification(verificationId) {
    const d = await load();
    const v = d.verifications.find((x) => x.id === verificationId);
    if (v) v.consent_granted = false;
    await save();
  },

  async orgForMember(profileId) {
    const d = await load();
    const m = d.members.find((x) => x.profile_id === profileId);
    return m ? (d.orgs.find((o) => o.id === m.org_id) ?? null) : null;
  },

  async createOrgAndJoin(profileId, name, kind, district) {
    const d = await load();
    const org: Organization = { id: uid(), name, kind, district, verified: false };
    d.orgs.push(org);
    d.members.push({ org_id: org.id, profile_id: profileId });
    await save();
    return org;
  },

  async orgRequests(orgId) {
    const d = await load();
    return d.verifications
      .filter((v) => v.org_id === orgId && v.status === 'pending')
      .map((v) => ({ ...v, teen: d.users.find((u) => u.id === v.teen_id)!.profile }));
  },

  async decideVerification(verificationId, status: VerifyStatus) {
    const d = await load();
    const v = d.verifications.find((x) => x.id === verificationId);
    if (v) {
      v.status = status;
      v.decided_at = new Date().toISOString();
    }
    await save();
  },

  async orgStudents(orgId) {
    const d = await load();
    const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
    // Consent gate mirrors the Supabase RLS: only verified + consent_granted teens are visible.
    return consentedTeenIds(d, orgId).map((teenId): OrgStudent => {
      const user = d.users.find((u) => u.id === teenId)!;
      const verification = d.verifications.find((v) => v.teen_id === teenId && v.org_id === orgId)!;
      return {
        profile: user.profile,
        verification,
        activeTasks: d.tasks.filter((t) => t.teen_id === teenId && t.active).length,
        minutesThisWeek: d.logs
          .filter((l) => l.teen_id === teenId && l.completed_at >= weekAgo)
          .reduce((s, l) => s + (l.minutes ?? 0), 0),
      };
    });
  },

  async listResources() {
    const d = await load();
    return d.resources;
  },

  async upsertResource(orgId, r) {
    const d = await load();
    if (r.id) {
      const existing = d.resources.find((x) => x.id === r.id && x.org_id === orgId);
      if (!existing) throw new Error('Resource not found');
      Object.assign(existing, r);
      await save();
      return existing;
    }
    const created: Resource = { ...r, id: uid(), org_id: orgId };
    d.resources.push(created);
    await save();
    return created;
  },

  async deleteResource(id) {
    const d = await load();
    d.resources = d.resources.filter((r) => r.id !== id);
    d.shares = d.shares.filter((s) => s.resource_id !== id);
    await save();
  },

  async myShares(teenId) {
    const d = await load();
    return d.shares.filter((s) => s.teen_id === teenId);
  },

  async toggleSaveResource(teenId, resourceId) {
    const d = await load();
    const existing = d.shares.find((s) => s.teen_id === teenId && s.resource_id === resourceId && !s.shared_by_org);
    if (existing) {
      existing.saved = !existing.saved;
    } else {
      d.shares.push({ id: uid(), teen_id: teenId, resource_id: resourceId, shared_by_org: null, shared_at: new Date().toISOString(), saved: true });
    }
    await save();
  },

  async shareResourceToTeen(orgId, teenId, resourceId) {
    const d = await load();
    if (!consentedTeenIds(d, orgId).includes(teenId)) throw new Error('Teen has not granted consent.');
    if (d.shares.some((s) => s.teen_id === teenId && s.resource_id === resourceId && s.shared_by_org === orgId)) return;
    d.shares.push({ id: uid(), teen_id: teenId, resource_id: resourceId, shared_by_org: orgId, shared_at: new Date().toISOString(), saved: false });
    await save();
  },
};
