import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Bookmark, ExternalLink, School } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { CategoryBadge } from '@/components/keel/CategoryBadge';
import { Chips } from '@/components/keel/Chips';
import { EmptyState } from '@/components/keel/EmptyState';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { repo } from '@/lib/repo';
import { useMyShares, useMyVerifications, useOrganizations, useResources, useUserId } from '@/lib/hooks';
import type { Resource } from '@/lib/types';
import { radius, shadow, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const CATEGORIES = ['all', 'respite', 'food', 'mental_health', 'legal', 'financial', 'training'] as const;

function ResourceCard({ r, saved, sharedByOrg, onSave }: { r: Resource; saved: boolean; sharedByOrg: boolean; onSave: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={[styles.resCard, shadow.card, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <CategoryBadge category={r.category} label={t(`support.categories.${r.category}`)} />
        <Pressable
          onPress={onSave}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={saved ? t('support.saved') : t('support.save')}>
          <Bookmark size={20} color={saved ? colors.primary : colors.textFaint} fill={saved ? colors.primary : 'none'} />
        </Pressable>
      </View>
      <Text style={[type.bodyBold, { color: colors.text }]}>{r.title}</Text>
      {sharedByOrg ? (
        <Text style={[type.micro, { color: colors.primary }]}>{t('support.sharedByOrg')}</Text>
      ) : null}
      {r.description ? <Text style={[type.small, { color: colors.textMuted }]}>{r.description}</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[type.small, { color: colors.textFaint }]}>
          {[r.location, r.district].filter(Boolean).join(' · ')}
        </Text>
        {r.url ? (
          <Pressable
            onPress={() => Linking.openURL(r.url!)}
            accessibilityRole="link"
            accessibilityLabel={t('support.open')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ExternalLink size={15} color={colors.primary} />
            <Text style={[type.smallBold, { color: colors.primary }]}>{t('support.open')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function Support() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const teenId = useUserId();
  const qc = useQueryClient();
  const orgs = useOrganizations();
  const verifications = useMyVerifications();
  const resources = useResources();
  const shares = useMyShares();
  const [category, setCategory] = useState<string>('all');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['verifications', teenId] });
    qc.invalidateQueries({ queryKey: ['shares', teenId] });
  };

  const request = useMutation({
    mutationFn: (orgId: string) => repo.requestVerification(teenId, orgId),
    onSuccess: invalidate,
  });
  const consent = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) => repo.setConsent(id, on),
    onSuccess: invalidate,
  });
  const toggleSave = useMutation({
    mutationFn: (resourceId: string) => repo.toggleSaveResource(teenId, resourceId),
    onSuccess: invalidate,
  });

  const verifiedAny = (verifications.data ?? []).some((v) => v.status === 'verified');
  const requestedOrgIds = new Set((verifications.data ?? []).map((v) => v.org_id));

  const visibleResources = useMemo(() => {
    const all = resources.data ?? [];
    return category === 'all' ? all : all.filter((r) => r.category === category);
  }, [resources.data, category]);

  const shareFor = (resourceId: string) => (shares.data ?? []).filter((s) => s.resource_id === resourceId);

  return (
    <Screen>
      <SectionHeader title={t('support.title')} />
      <Text style={[type.body, { color: colors.textMuted, marginBottom: spacing.md }]}>{t('support.findOrgBody')}</Text>

      {/* Verification + consent per org */}
      <View style={{ gap: spacing.md }}>
        {(orgs.data ?? []).map((org) => {
          const v = (verifications.data ?? []).find((x) => x.org_id === org.id);
          return (
            <View key={org.id} style={[styles.orgCard, shadow.card, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <School size={22} color={colors.periwinkle} />
                <View style={{ flex: 1 }}>
                  <Text style={[type.bodyBold, { color: colors.text }]}>{org.name}</Text>
                  <Text style={[type.small, { color: colors.textFaint }]}>
                    {t(`org.kinds.${org.kind}`)}{org.district ? ` · ${org.district}` : ''}
                  </Text>
                </View>
                {v?.status === 'verified' ? <BadgeCheck size={22} color={colors.primary} /> : null}
              </View>
              {!v ? (
                <PrimaryButton
                  title={t('support.request')}
                  variant="ghost"
                  loading={request.isPending && !requestedOrgIds.has(org.id)}
                  onPress={() => request.mutate(org.id)}
                />
              ) : v.status === 'pending' ? (
                <Text style={[type.smallBold, { color: colors.amber }]}>{t('support.pending')}…</Text>
              ) : v.status === 'declined' ? (
                <Text style={[type.smallBold, { color: colors.danger }]}>{t('support.declined')}</Text>
              ) : (
                <View style={styles.consentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.smallBold, { color: colors.text }]}>{t('support.consentTitle')}</Text>
                    <Text style={[type.small, { color: colors.textMuted }]}>{t('support.consentBody')}</Text>
                  </View>
                  <Switch
                    value={v.consent_granted}
                    onValueChange={(on) => consent.mutate({ id: v.id, on })}
                    trackColor={{ true: colors.primary, false: colors.hairline }}
                    thumbColor="#fff"
                    accessibilityLabel={t('support.consentTitle')}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Resources — unlocked by any verification */}
      <SectionHeader title={t('support.resources')} />
      {!verifiedAny ? (
        <EmptyState title={t('support.locked')} />
      ) : (
        <>
          <View style={{ marginBottom: spacing.md }}>
            <Chips
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c, label: t(`support.categories.${c}`) }))}
            />
          </View>
          <View style={{ gap: spacing.md }}>
            {visibleResources.map((r) => {
              const rs = shareFor(r.id);
              return (
                <ResourceCard
                  key={r.id}
                  r={r}
                  saved={rs.some((s) => s.saved)}
                  sharedByOrg={rs.some((s) => s.shared_by_org)}
                  onSave={() => toggleSave.mutate(r.id)}
                />
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  orgCard: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.md },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  resCard: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.sm },
});
