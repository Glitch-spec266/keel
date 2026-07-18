export type UserRole = 'teen' | 'org';
export type VerifyStatus = 'pending' | 'verified' | 'declined';
export type TaskKind = 'medication' | 'appointment' | 'task';
export type ResourceCategory = 'respite' | 'food' | 'mental_health' | 'legal' | 'financial' | 'training';

export type Session = {
  userId: string;
  email: string;
  role: UserRole;
  displayName: string | null;
  handle: string | null;
};

export type Profile = {
  id: string;
  role: UserRole;
  display_name: string | null;
  handle: string | null;
  age_band: string | null;
  locale: string;
};

export type Organization = {
  id: string;
  name: string;
  kind: 'school' | 'nonprofit' | 'clinic';
  district: string | null;
  verified: boolean;
};

export type CareRecipient = {
  id: string;
  teen_id: string;
  alias: string;
  relationship: string | null;
  conditions: string[];
  notes: string | null;
};

export type CareTask = {
  id: string;
  teen_id: string;
  recipient_id: string | null;
  kind: TaskKind;
  title: string;
  dose: string | null;
  rrule: string | null;
  next_due: string | null; // ISO
  notify_minutes_before: number;
  active: boolean;
};

export type TaskLog = {
  id: string;
  task_id: string;
  teen_id: string;
  completed_at: string; // ISO
  minutes: number | null;
  note: string | null;
};

export type Verification = {
  id: string;
  teen_id: string;
  org_id: string;
  status: VerifyStatus;
  consent_granted: boolean;
  requested_at: string;
  decided_at: string | null;
  org?: Organization;
};

export type Resource = {
  id: string;
  org_id: string | null;
  title: string;
  category: ResourceCategory;
  description: string | null;
  url: string | null;
  location: string | null;
  district: string | null;
};

export type ResourceShare = {
  id: string;
  teen_id: string;
  resource_id: string;
  shared_by_org: string | null;
  shared_at: string;
  saved: boolean;
};

export type OrgStudent = {
  profile: Profile;
  verification: Verification;
  activeTasks: number;
  minutesThisWeek: number;
};
