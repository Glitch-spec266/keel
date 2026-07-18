import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { CareTask } from './types';

// Reminders are local notifications scheduled from each task's next_due minus its lead time.
// Native: expo-notifications. Web: best-effort browser Notification while the tab is open.

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const webTimers = new Map<string, ReturnType<typeof setTimeout>>();

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  }
  if (!Device.isDevice) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

function fireTime(task: CareTask): Date | null {
  if (!task.next_due || !task.active) return null;
  const t = new Date(task.next_due).getTime() - (task.notify_minutes_before ?? 0) * 60_000;
  return t > Date.now() ? new Date(t) : null;
}

/** (Re)schedule the reminder for one task; cancels any previous one for the same task. */
export async function scheduleTaskReminder(task: CareTask): Promise<void> {
  await cancelTaskReminder(task.id);
  const when = fireTime(task);
  if (!when) return;
  const body = task.dose ? `${task.title} — ${task.dose}` : task.title;

  if (Platform.OS === 'web') {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const id = setTimeout(() => {
      new Notification('Keel reminder', { body });
      webTimers.delete(task.id);
    }, when.getTime() - Date.now());
    webTimers.set(task.id, id);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: `keel-task-${task.id}`,
    content: { title: 'Keel reminder', body, data: { taskId: task.id } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  if (Platform.OS === 'web') {
    const t = webTimers.get(taskId);
    if (t) clearTimeout(t);
    webTimers.delete(taskId);
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(`keel-task-${taskId}`).catch(() => {});
}

/** Re-sync all reminders (call after login and after any task mutation batch). */
export async function syncAllReminders(tasks: CareTask[]): Promise<void> {
  for (const t of tasks) await scheduleTaskReminder(t);
}

/** Notification tap → route (native only). Returns an unsubscribe fn. */
export function onNotificationTap(handler: (taskId: string) => void): () => void {
  if (Platform.OS === 'web') return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
    const taskId = resp.notification.request.content.data?.taskId;
    if (typeof taskId === 'string') handler(taskId);
  });
  return () => sub.remove();
}
