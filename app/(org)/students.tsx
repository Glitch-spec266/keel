import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/keel/EmptyState';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { repo } from '@/lib/repo';
import { useMyOrg } from '@/lib/hooks';
import { radius, shadow, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function OrgStudents() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const org = useMyOrg();
  const orgId = org.data?.id ?? '';
  const students = useQuery({
    queryKey: ['orgStudents', orgId],
    queryFn: () => repo.orgStudents(orgId),
    enabled: !!orgId,
  });

  return (
    <Screen>
      <SectionHeader title={t('org.students')} hint={org.data?.name} />
      {students.isLoading ? (
        <Text style={[type.body, { color: colors.textMuted }]}>{t('common.loading')}</Text>
      ) : (students.data ?? []).length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={24} color={colors.primary} />}
          title={t('org.noStudents')}
          body={t('org.noStudentsBody')}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {(students.data ?? []).map((s) => (
            <View key={s.profile.id} style={[styles.card, shadow.card, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
              <ShieldCheck size={22} color={colors.primary} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[type.bodyBold, { color: colors.text }]}>{s.profile.display_name ?? s.profile.handle}</Text>
                <Text style={[type.small, { color: colors.textMuted }]}>
                  {t('org.tasksActive', { count: s.activeTasks })} · {t('org.minsWeek', { count: s.minutesThisWeek })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
});
