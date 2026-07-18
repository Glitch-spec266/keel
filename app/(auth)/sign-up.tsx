import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Building2, HeartHandshake } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Field } from '@/components/keel/Field';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { Sheet } from '@/components/keel/Sheet';
import type { UserRole } from '@/lib/types';
import { radius, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

const schema = z.object({
  displayName: z.string().min(1).max(60),
  email: z.string().email(),
  password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

function RoleCard({ icon, title, hint, active, onPress }: { icon: React.ReactNode; title: string; hint: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${title}. ${hint}`}
      style={[
        styles.roleCard,
        { backgroundColor: colors.surface, borderColor: active ? colors.primary : colors.hairline, borderWidth: active ? 2 : 1.2 },
      ]}>
      {icon}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.bodyBold, { color: colors.text }]}>{title}</Text>
        <Text style={[type.small, { color: colors.textMuted }]}>{hint}</Text>
      </View>
    </Pressable>
  );
}

export default function SignUp() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const signUp = useSession((s) => s.signUp);
  const setLockEnabled = useSession((s) => s.setLockEnabled);
  const [role, setRole] = useState<UserRole>('teen');
  const [serverError, setServerError] = useState<string | null>(null);
  const [showLockOffer, setShowLockOffer] = useState(false);
  const [nextRoute, setNextRoute] = useState<'/(teen)' | '/(org)'>('/(teen)');
  const { control, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const session = await signUp(values.email.trim(), values.password, role, values.displayName.trim());
      const dest = session.role === 'org' ? '/(org)' : '/(teen)';
      setNextRoute(dest);
      if (Platform.OS !== 'web') setShowLockOffer(true);
      else router.replace(dest);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : t('common.error'));
    }
  });

  return (
    <Screen>
      <SectionHeader title={t('auth.signUp')} />
      <Text style={[type.smallBold, { color: colors.textMuted, marginBottom: spacing.sm }]}>{t('auth.roleQuestion')}</Text>
      <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
        <RoleCard
          icon={<HeartHandshake size={26} color={colors.primary} />}
          title={t('auth.roleTeen')}
          hint={t('auth.roleTeenHint')}
          active={role === 'teen'}
          onPress={() => setRole('teen')}
        />
        <RoleCard
          icon={<Building2 size={26} color={colors.periwinkle} />}
          title={t('auth.roleOrg')}
          hint={t('auth.roleOrgHint')}
          active={role === 'org'}
          onPress={() => setRole('org')}
        />
      </View>
      <Controller
        control={control}
        name="displayName"
        render={({ field, fieldState }) => (
          <Field
            label={t('auth.displayName')}
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error ? 'Required' : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Field
            label={t('auth.email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error ? 'Enter a valid email' : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Field
            label={t('auth.password')}
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error ? 'At least 6 characters' : undefined}
          />
        )}
      />
      {serverError ? <Text style={[type.small, { color: colors.danger, marginBottom: spacing.md }]}>{serverError}</Text> : null}
      <PrimaryButton title={t('auth.signUp')} onPress={submit} loading={formState.isSubmitting} />
      <PrimaryButton
        title={t('auth.haveAccount')}
        variant="ghost"
        onPress={() => router.replace('/(auth)/sign-in')}
        style={{ marginTop: spacing.md }}
      />

      <Sheet visible={showLockOffer} onClose={() => { setShowLockOffer(false); router.replace(nextRoute); }} title={t('auth.appLockTitle')}>
        <Text style={[type.body, { color: colors.textMuted, marginBottom: spacing.xl }]}>{t('auth.appLockBody')}</Text>
        <View style={{ gap: spacing.md }}>
          <PrimaryButton
            title={t('auth.enableLock')}
            onPress={async () => {
              await setLockEnabled(true);
              setShowLockOffer(false);
              router.replace(nextRoute);
            }}
          />
          <PrimaryButton
            title={t('auth.skipLock')}
            variant="ghost"
            onPress={() => { setShowLockOffer(false); router.replace(nextRoute); }}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
});
