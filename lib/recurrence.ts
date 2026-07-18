import dayjs from 'dayjs';
import { RRule } from 'rrule';

// Presets keep recurrence choices simple for a stressed user; raw RFC5545 stays in the data model.
export const RECURRENCE_PRESETS = [
  { value: '', labelKey: 'recurrence.once' },
  { value: 'FREQ=DAILY', labelKey: 'recurrence.daily' },
  { value: 'FREQ=WEEKLY', labelKey: 'recurrence.weekly' },
  { value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', labelKey: 'recurrence.weekdays' },
  { value: 'FREQ=MONTHLY', labelKey: 'recurrence.monthly' },
] as const;

export function nextOccurrence(rruleStr: string | null, from: Date, anchor: Date): Date | null {
  if (!rruleStr) return null;
  try {
    const rule = RRule.fromString(`DTSTART:${formatDtStart(anchor)}\nRRULE:${rruleStr}`);
    return rule.after(from, false);
  } catch {
    return null;
  }
}

function formatDtStart(d: Date): string {
  // Local-naive DTSTART keeps "6pm every day" meaning 6pm local.
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

/** After completing an occurrence, advance next_due to the following one (or null if one-off). */
export function advanceNextDue(task: { rrule: string | null; next_due: string | null }): string | null {
  if (!task.rrule || !task.next_due) return null;
  const cur = new Date(task.next_due);
  const next = nextOccurrence(task.rrule, cur, cur);
  return next ? next.toISOString() : null;
}

export function describeDue(nextDue: string | null): string {
  if (!nextDue) return '';
  const d = dayjs(nextDue);
  if (d.isSame(dayjs(), 'day')) return d.format('h:mm A');
  if (d.isSame(dayjs().add(1, 'day'), 'day')) return `Tomorrow ${d.format('h:mm A')}`;
  return d.format('ddd MMM D, h:mm A');
}
