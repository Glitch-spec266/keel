import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, Eye, Globe, LockKeyhole, Trash2, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { EmptyState } from '@/components/keel/EmptyState';
import { Field } from '@/components/keel/Field';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { Sheet } from '@/components/keel/Sheet';
import i18n from '@/lib/i18n';
import { repo, isDemoMode } from '@/lib/repo';
import { useMyVerifications, useRecipients, useUserId } from '@/lib/hooks';
import { radius, shadow, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

function Row({ icon, title, hint, right, onPress }: { icon: React.ReactNode; title: string; hint?: string; right?: React.ReactNode; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={hint ? `${title}. ${hint}` : title}
      style={[styles.row, shadow.card, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
      {icon}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.bodyBold, { color: colors.text }]}>{title}</Text>
        {hint ? <Text style={[type.small, { color: colors.textMuted }]}>{hint}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const teenId = useUserId();
  const qc = useQueryClient();
  const session = useSession((s) => s.session);
  const signOut = useSession((s) => s.signOut);
  const { lockEnabled, setLockEnabled } = useSession();
  const recipients = useRecipients();
  const verifications = useMyVerifications();
  const [addOpen, setAddOpen] = useState(false);
  const [alias, setAlias] = useState('');
  const [relationship, setRelationship] = useState('');

  const addRecipient = useMutation({
    mutationFn: () => repo.addRecipient(teenId, alias.trim(), relationship.trim() || null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipients', teenId] });
      setAddOpen(false);
      setAlias('');
      setRelationship('');
    },
  });
  const removeRecipient = useMutation({
    mutationFn: (id: string) => repo.deleteRecipient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipients', teenId] }),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => repo.revokeVerification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verifications', teenId] }),
  });

  const consented = (verifications.data ?? []).filter((v) => v.status === 'verified' && v.consent_granted);
  const otherLang = i18n.language === 'es' ? 'en' : 'es';

  return (
    <Screen>
      <SectionHeader title={t('profile.title')} />
      <Text style={[type.body, { color: colors.textMuted, marginBottom: spacing.sm }]}>
        {session?.displayName} · {session?.handle}
      </Text>
      {isDemoMode ? (
        <Text style={[type.micro, { color: colors.amber, marginBottom: spacing.md }]}>{t('profile.demoBadge')}</Text>
      ) : null}

      {/* Who can see my data */}
      <SectionHeader title={t('profile.whoCanSee')} />
      {consented.length === 0 ? (
        <EmptyState icon={<Eye size={22} color={colors.primary} />} title={t('profile.noOrgs')} />
      ) : (
        <View style={{ gap: spacing.md }}>
          {consented.map((v) => (
            <Row
              key={v.id}
              icon={<Eye size={20} color={colors.periwinkle} />}
              title={v.org?.name ?? 'Organization'}
              hint={t('support.consentTitle')}
              right={
                <PrimaryButton
                  title={t('profile.revoke')}
                  variant="danger"
                  onPress={() => revoke.mutate(v.id)}
                  style={{ minHeight: 40, paddingVertical: 6 }}
                />
              }
            />
          ))}
        </View>
      )}

      {/* Recipients */}
      <SectionHeader title={t('profile.recipients')} />
      <View style={{ gap: spacing.md }}>
        {(recipients.data ?? []).map((r) => (
          <Row
            key={r.id}
            icon={<Users size={20} color={colors.primary} />}
            title={r.alias}
            hint={r.relationship ?? undefined}
            right={
              <Pressable
                onPress={() => removeRecipient.mutate(r.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${t('common.delete')} ${r.alias}`}>
                <Trash2 size={18} color={colors.textFaint} />
              </Pressable>
            }
          />
        ))}
        <PrimaryButton title={t('recipients.add')} variant="ghost" onPress={() => setAddOpen(true)} />
      </View>

      {/* Settings */}
      <SectionHeader title={t('tabs.profile')} />
      <View style={{ gap: spacing.md }}>
        {Platform.OS !== 'web' ? (
          <Row
            icon={<LockKeyhole size={20} color={colors.primary} />}
            title={t('profile.appLock')}
            right={
              <Switch
                value={lockEnabled}
                onValueChange={(on) => setLockEnabled(on)}
                trackColor={{ true: colors.primary, false: colors.hairline }}
                thumbColor="#fff"
                accessibilityLabel={t('profile.appLock')}
              />
            }
          />
        ) : null}
        <Row
          icon={<Globe size={20} color={colors.periwinkle} />}
          title={t('profile.language')}
          hint={i18n.language === 'es' ? 'Español' : 'English'}
          onPress={() => i18n.changeLanguage(otherLang)}
          right={<Text style={[type.smallBold, { color: colors.primary }]}>{otherLang.toUpperCase()}</Text>}
        />
        {/* Phase 2 stubs — entry points only, per scope guardrail */}
        <Row
          icon={<Archive size={20} color={colors.textFaint} />}
          title={t('profile.vault')}
          hint={t('profile.vaultHint')}
          right={<Text style={[type.micro, { color: colors.textFaint }]}>{t('profile.comingSoon')}</Text>}
        />
        <Row
          icon={<Users size={20} color={colors.textFaint} />}
          title={t('profile.circle')}
          hint={t('profile.circleHint')}
          right={<Text style={[type.micro, { color: colors.textFaint }]}>{t('profile.comingSoon')}</Text>}
        />
      </View>

      <PrimaryButton title={t('common.signOut')} variant="ghost" style={{ marginTop: spacing.xxl }} onPress={() => signOut()} />

      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title={t('recipients.add')}>
        <Field label={t('recipients.alias')} value={alias} onChangeText={setAlias} />
        <Field label={t('recipients.relationship')} value={relationship} onChangeText={setRelationship} />
        <PrimaryButton
          title={t('common.save')}
          loading={addRecipient.isPending}
          disabled={!alias.trim()}
          onPress={() => addRecipient.mutate()}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    minHeight: 56,
  },
});
