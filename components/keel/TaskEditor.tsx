import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';

dayjs.extend(customParseFormat);
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ensureNotificationPermission } from '@/lib/notifications';
import { nextOccurrence, RECURRENCE_PRESETS } from '@/lib/recurrence';
import { useDeleteTask, useRecipients, useSaveTask } from '@/lib/hooks';
import type { CareTask, TaskKind } from '@/lib/types';
import { spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Chips } from './Chips';
import { Field } from './Field';
import { PrimaryButton } from './PrimaryButton';
import { Sheet } from './Sheet';

type Props = { visible: boolean; onClose: () => void; task?: CareTask | null };

// Create/edit sheet for a care task. Date/time as simple text fields (keyboard-friendly
// on web + native, no native-only picker dependency).
export function TaskEditor({ visible, onClose, task }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const recipients = useRecipients();
  const saveTask = useSaveTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<TaskKind>('medication');
  const [dose, setDose] = useState('');
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [time, setTime] = useState('18:00');
  const [rrule, setRrule] = useState('FREQ=DAILY');
  const [remind, setRemind] = useState('10');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    if (task) {
      setTitle(task.title);
      setKind(task.kind);
      setDose(task.dose ?? '');
      setRecipientId(task.recipient_id);
      const d = task.next_due ? dayjs(task.next_due) : dayjs();
      setDate(d.format('YYYY-MM-DD'));
      setTime(d.format('HH:mm'));
      setRrule(task.rrule ?? '');
      setRemind(String(task.notify_minutes_before ?? 0));
    } else {
      setTitle('');
      setKind('medication');
      setDose('');
      setRecipientId(recipients.data?.[0]?.id ?? null);
      setDate(dayjs().format('YYYY-MM-DD'));
      setTime('18:00');
      setRrule('FREQ=DAILY');
      setRemind('10');
    }
  }, [visible, task, recipients.data]);

  const submit = async () => {
    if (!title.trim()) {
      setError(t('schedule.taskTitle'));
      return;
    }
    const firstDue = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    if (!firstDue.isValid()) {
      setError(`${t('schedule.dateHint')} · ${t('schedule.timeHint')}`);
      return;
    }
    // If the chosen first occurrence is already past, roll forward along the rule.
    let due = firstDue.toDate();
    if (due.getTime() < Date.now() && rrule) {
      due = nextOccurrence(rrule, new Date(), due) ?? due;
    }
    await ensureNotificationPermission();
    await saveTask.mutateAsync({
      id: task?.id,
      title: title.trim(),
      kind,
      dose: dose.trim() || null,
      recipient_id: recipientId,
      rrule: rrule || null,
      next_due: due.toISOString(),
      notify_minutes_before: Math.max(0, parseInt(remind, 10) || 0),
    });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={task ? t('schedule.editTask') : t('schedule.addTask')}>
      <Field label={t('schedule.taskTitle')} value={title} onChangeText={setTitle} error={error ?? undefined} />
      <Text style={[type.smallBold, { color: colors.textMuted, marginBottom: 6 }]}>{t('schedule.kind')}</Text>
      <View style={{ marginBottom: spacing.lg }}>
        <Chips
          label={t('schedule.kind')}
          value={kind}
          onChange={(v) => setKind(v as TaskKind)}
          options={(['medication', 'appointment', 'task'] as const).map((k) => ({ value: k, label: t(`schedule.kinds.${k}`) }))}
        />
      </View>
      {kind === 'medication' ? <Field label={t('schedule.dose')} value={dose} onChangeText={setDose} /> : null}
      {recipients.data && recipients.data.length > 0 ? (
        <>
          <Text style={[type.smallBold, { color: colors.textMuted, marginBottom: 6 }]}>{t('schedule.recipient')}</Text>
          <View style={{ marginBottom: spacing.lg }}>
            <Chips
              label={t('schedule.recipient')}
              value={recipientId}
              onChange={setRecipientId}
              options={recipients.data.map((r) => ({ value: r.id, label: r.alias }))}
            />
          </View>
        </>
      ) : null}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Field label={`${t('schedule.when')} (${t('schedule.dateHint')})`} value={date} onChangeText={setDate} autoCapitalize="none" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label={t('schedule.timeHint')} value={time} onChangeText={setTime} autoCapitalize="none" />
        </View>
      </View>
      <Text style={[type.smallBold, { color: colors.textMuted, marginBottom: 6 }]}>{t('schedule.recurrence')}</Text>
      <View style={{ marginBottom: spacing.lg }}>
        <Chips
          label={t('schedule.recurrence')}
          value={rrule}
          onChange={setRrule}
          options={RECURRENCE_PRESETS.map((p) => ({ value: p.value, label: t(p.labelKey) }))}
        />
      </View>
      <Field label={t('schedule.remindBefore')} value={remind} onChangeText={setRemind} keyboardType="number-pad" />
      <PrimaryButton title={t('common.save')} onPress={submit} loading={saveTask.isPending} />
      {task ? (
        <PrimaryButton
          title={t('common.delete')}
          variant="danger"
          style={{ marginTop: spacing.md }}
          loading={deleteTask.isPending}
          onPress={async () => {
            await deleteTask.mutateAsync(task.id);
            onClose();
          }}
        />
      ) : null}
    </Sheet>
  );
}
