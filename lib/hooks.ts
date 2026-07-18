import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { repo, type NewTask } from './repo';
import { advanceNextDue } from './recurrence';
import { cancelTaskReminder, scheduleTaskReminder } from './notifications';
import type { CareTask } from './types';
import { useSession } from '@/state/useSession';

export function useUserId(): string {
  return useSession((s) => s.session?.userId) ?? '';
}

export function useTasks() {
  const teenId = useUserId();
  return useQuery({ queryKey: ['tasks', teenId], queryFn: () => repo.listTasks(teenId), enabled: !!teenId });
}

export function useRecipients() {
  const teenId = useUserId();
  return useQuery({ queryKey: ['recipients', teenId], queryFn: () => repo.listRecipients(teenId), enabled: !!teenId });
}

export function useLogsSince(sinceIso: string) {
  const teenId = useUserId();
  return useQuery({
    queryKey: ['logs', teenId, sinceIso],
    queryFn: () => repo.listLogs(teenId, sinceIso),
    enabled: !!teenId,
  });
}

export function useSaveTask() {
  const teenId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: NewTask) => {
      const saved = await repo.upsertTask(teenId, task);
      await scheduleTaskReminder(saved); // (re)schedule the local notification
      return saved;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', teenId] }),
  });
}

export function useDeleteTask() {
  const teenId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await cancelTaskReminder(id);
      await repo.deleteTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', teenId] }),
  });
}

export function useCompleteTask() {
  const teenId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, minutes }: { task: CareTask; minutes: number | null }) => {
      const nextDue = advanceNextDue(task);
      const updated = await repo.completeTask(task, minutes, nextDue);
      await scheduleTaskReminder(updated); // next occurrence (no-op if task retired)
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', teenId] });
      qc.invalidateQueries({ queryKey: ['logs', teenId] });
    },
  });
}

export function useMyVerifications() {
  const teenId = useUserId();
  return useQuery({ queryKey: ['verifications', teenId], queryFn: () => repo.myVerifications(teenId), enabled: !!teenId });
}

export function useOrganizations() {
  return useQuery({ queryKey: ['organizations'], queryFn: () => repo.listOrganizations() });
}

export function useResources() {
  return useQuery({ queryKey: ['resources'], queryFn: () => repo.listResources() });
}

export function useMyShares() {
  const teenId = useUserId();
  return useQuery({ queryKey: ['shares', teenId], queryFn: () => repo.myShares(teenId), enabled: !!teenId });
}

export function useMyOrg() {
  const userId = useUserId();
  return useQuery({ queryKey: ['myOrg', userId], queryFn: () => repo.orgForMember(userId), enabled: !!userId });
}

export function todayRange(): { startIso: string } {
  return { startIso: dayjs().startOf('day').toISOString() };
}
