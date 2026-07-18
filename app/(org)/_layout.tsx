import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Redirect, Tabs } from 'expo-router';
import { Inbox, Library, UsersRound } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { Chips } from '@/components/keel/Chips';
import { Field } from '@/components/keel/Field';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { repo } from '@/lib/repo';
import { useMyOrg, useUserId } from '@/lib/hooks';
import type { Organization } from '@/lib/types';
import { spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

// First-run gate: an org member without an organization sets one up here.
function OrgSetup() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const userId = useUserId();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Organization['kind']>('school');
  const [district, setDistrict] = useState('');
  const create = useMutation({
    mutationFn: () => repo.createOrgAndJoin(userId, name.trim(), kind, district.trim() || null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myOrg', userId] }),
  });
  return (
    <Screen>
      <SectionHeader title={t('org.orgSetupTitle')} />
      <Field label={t('org.orgName')} value={name} onChangeText={setName} />
      <Text style={[type.smallBold, { color: colors.textMuted, marginBottom: 6 }]}>{t('org.orgKind')}</Text>
      <Chips
        value={kind}
        onChange={(v) => setKind(v as Organization['kind'])}
        options={(['school', 'nonprofit', 'clinic'] as const).map((k) => ({ value: k, label: t(`org.kinds.${k}`) }))}
      />
      <Field label={t('org.district')} value={district} onChangeText={setDistrict} style={{ marginTop: spacing.lg }} />
      <PrimaryButton title={t('org.create')} disabled={!name.trim()} loading={create.isPending} onPress={() => create.mutate()} />
    </Screen>
  );
}

export default function OrgLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const session = useSession((s) => s.session);
  const org = useMyOrg();
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (session.role !== 'org') return <Redirect href="/(teen)" />;
  if (org.isLoading) return null;
  if (!org.data) return <OrgSetup />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: type.smallBold.fontFamily, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.hairline,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.requests'), tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="students"
        options={{ title: t('tabs.students'), tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="resources"
        options={{ title: t('tabs.resources'), tabBarIcon: ({ color, size }) => <Library color={color} size={size} /> }}
      />
    </Tabs>
  );
}
