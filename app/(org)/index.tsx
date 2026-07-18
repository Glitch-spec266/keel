import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Inbox } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/keel/EmptyState';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { repo } from '@/lib/repo';
import { useMyOrg } from '@/lib/hooks';
import type { VerifyStatus } from '@/lib/types';
import { radius, shadow, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

export default function OrgRequests() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const org = useMyOrg();
  const qc = useQueryClient();
  const signOut = useSession((s) => s.signOut);
  const orgId = org.data?.id ?? '';

  const requests = useQuery({
    queryKey: ['orgRequests', orgId],
    queryFn: () => repo.orgRequests(orgId),
    enabled: !!orgId,
  });
  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VerifyStatus }) => repo.decideVerification(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orgRequests', orgId] });
      qc.invalidateQueries({ queryKey: ['orgStudents', orgId] });
    },
  });

  return (
    <Screen>
      <SectionHeader title={t('org.requests')} hint={org.data?.name} />
      {requests.isLoading ? (
        <Text style={[type.body, { color: colors.textMuted }]}>{t('common.loading')}</Text>
      ) : (requests.data ?? []).length === 0 ? (
        <EmptyState icon={<Inbox size={24} color={colors.primary} />} title={t('org.noRequests')} body={t('org.noRequestsBody')} />
      ) : (
        <View style={{ gap: spacing.md }}>
          {(requests.data ?? []).map((r) => (
            <View key={r.id} style={[styles.card, shadow.card, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
              <View style={{ flex: 1 }}>
                <Text style={[type.bodyBold, { color: colors.text }]}>{r.teen.display_name ?? r.teen.handle}</Text>
                <Text style={[type.small, { color: colors.textFaint }]}>{r.teen.handle}</Text>
              </View>
              <PrimaryButton
                title={t('org.verify')}
                onPress={() => decide.mutate({ id: r.id, status: 'verified' })}
                style={{ minHeight: 40, paddingVertical: 6 }}
              />
              <PrimaryButton
                title={t('org.decline')}
                variant="ghost"
                onPress={() => decide.mutate({ id: r.id, status: 'declined' })}
                style={{ minHeight: 40, paddingVertical: 6 }}
              />
            </View>
          ))}
        </View>
      )}
      <PrimaryButton title={t('common.signOut')} variant="ghost" style={{ marginTop: spacing.xxl }} onPress={() => signOut()} />
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
