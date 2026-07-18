import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { EmptyState } from '@/components/keel/EmptyState';
import { Field } from '@/components/keel/Field';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { Sheet } from '@/components/keel/Sheet';
import { TaskCard } from '@/components/keel/TaskCard';
import { TaskEditor } from '@/components/keel/TaskEditor';
import { describeDue } from '@/lib/recurrence';
import { useCompleteTask, useRecipients, useTasks } from '@/lib/hooks';
import type { CareTask } from '@/lib/types';
import { spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Schedule() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const tasks = useTasks();
  const recipients = useRecipients();
  const complete = useCompleteTask();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CareTask | null>(null);
  const [logTask, setLogTask] = useState<CareTask | null>(null);
  const [minutes, setMinutes] = useState('15');

  const recipientAlias = (id: string | null) => recipients.data?.find((r) => r.id === id)?.alias ?? null;

  return (
    <Screen>
      <SectionHeader title={t('schedule.title')} />
      {tasks.isLoading ? (
        <Text style={[type.body, { color: colors.textMuted }]}>{t('common.loading')}</Text>
      ) : tasks.isError ? (
        <EmptyState title={t('common.error')} actionTitle={t('common.retry')} onAction={() => tasks.refetch()} />
      ) : (tasks.data ?? []).length === 0 ? (
        <EmptyState
          title={t('schedule.empty')}
          body={t('schedule.emptyBody')}
          actionTitle={t('schedule.addTask')}
          onAction={() => { setEditing(null); setEditorOpen(true); }}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {(tasks.data ?? []).map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              kind={task.kind}
              kindLabel={t(`schedule.kinds.${task.kind}`)}
              timeLabel={describeDue(task.next_due)}
              dose={task.dose}
              recipientAlias={recipientAlias(task.recipient_id)}
              onToggle={() => setLogTask(task)}
              onPress={() => { setEditing(task); setEditorOpen(true); }}
            />
          ))}
        </View>
      )}

      <PrimaryButton title={t('schedule.addTask')} style={{ marginTop: spacing.xl }} onPress={() => { setEditing(null); setEditorOpen(true); }} />

      <TaskEditor visible={editorOpen} onClose={() => setEditorOpen(false)} task={editing} />

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
