import dayjs from 'dayjs';
import { Plus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/keel/EmptyState';
import { GlassCard } from '@/components/keel/GlassCard';
import { ProgressRing } from '@/components/keel/ProgressRing';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { Sheet } from '@/components/keel/Sheet';
import { TaskCard } from '@/components/keel/TaskCard';
import { TaskEditor } from '@/components/keel/TaskEditor';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Field } from '@/components/keel/Field';
import { describeDue } from '@/lib/recurrence';
import { todayRange, useCompleteTask, useLogsSince, useRecipients, useTasks } from '@/lib/hooks';
import type { CareTask } from '@/lib/types';
import { shadow, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

export default function Today() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const session = useSession((s) => s.session);
  const tasks = useTasks();
  const recipients = useRecipients();
  const { startIso } = todayRange();
  const logs = useLogsSince(startIso);
  const complete = useCompleteTask();
  const [editorOpen, setEditorOpen] = useState(false);
  const [logTask, setLogTask] = useState<CareTask | null>(null);
  const [minutes, setMinutes] = useState('15');

  const dueToday = useMemo(
    () => (tasks.data ?? []).filter((x) => x.next_due && dayjs(x.next_due).isSame(dayjs(), 'day')),
    [tasks.data],
  );
  const doneToday = logs.data?.length ?? 0;
  const total = dueToday.length + doneToday;
  const nextUp = (tasks.data ?? []).slice(0, 3);

  const recipientAlias = (id: string | null) => recipients.data?.find((r) => r.id === id)?.alias ?? null;

  return (
    <Screen>
      <Text style={[type.display, { color: colors.text, marginBottom: spacing.sm }]}>
        {t('today.greeting', { name: session?.displayName?.split(' ')[0] ?? '' })}
      </Text>
      <Text style={[type.body, { color: colors.textMuted, marginBottom: spacing.lg }]}>
        {dayjs().format('dddd, MMMM D')}
      </Text>

      <GlassCard>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Text style={[type.heading, { color: colors.text }]}>{t('today.nextUp')}</Text>
            {nextUp.length === 0 ? (
              <Text style={[type.body, { color: colors.textMuted }]}>{t('today.allDone')}</Text>
            ) : (
              nextUp.map((task) => (
                <Text key={task.id} style={[type.body, { color: colors.textMuted }]} numberOfLines={1}>
                  {describeDue(task.next_due)} · {task.title}
                </Text>
              ))
            )}
          </View>
          <ProgressRing
            progress={total === 0 ? 0 : doneToday / total}
            label={`${doneToday}`}
            sublabel={t('today.progress', { done: doneToday, total })}
          />
        </View>
      </GlassCard>

      <SectionHeader title={t('tabs.today')} />
      {tasks.isLoading ? (
        <Text style={[type.body, { color: colors.textMuted }]}>{t('common.loading')}</Text>
      ) : dueToday.length === 0 ? (
        <EmptyState
          title={t('today.noTasks')}
          body={t('today.noTasksBody')}
          actionTitle={t('today.quickAdd')}
          onAction={() => setEditorOpen(true)}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {dueToday.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              kind={task.kind}
              kindLabel={t(`schedule.kinds.${task.kind}`)}
              timeLabel={describeDue(task.next_due)}
              dose={task.dose}
              recipientAlias={recipientAlias(task.recipient_id)}
              onToggle={() => setLogTask(task)}
            />
          ))}
        </View>
      )}

      <Text style={[type.small, { color: colors.textFaint, marginTop: spacing.xxl, textAlign: 'center' }]}>
        {t('today.notAlone')}
      </Text>

      {/* Quick-add FAB */}
      <Pressable
        onPress={() => setEditorOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('today.quickAdd')}
        style={[styles.fab, shadow.soft, { backgroundColor: colors.primary }]}>
        <Plus size={28} color={colors.onPrimary} strokeWidth={2.5} />
      </Pressable>

      <TaskEditor visible={editorOpen} onClose={() => setEditorOpen(false)} />

      {/* minutes capture on completion */}
      <Sheet visible={!!logTask} onClose={() => setLogTask(null)} title={t('schedule.logPrompt')}>
        <Field label={t('schedule.minutes')} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" />
        <PrimaryButton
          title={t('common.done')}
          loading={complete.isPending}
          onPress={async () => {
            if (logTask) await complete.mutateAsync({ task: logTask, minutes: parseInt(minutes, 10) || null });
            setLogTask(null);
          }}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
