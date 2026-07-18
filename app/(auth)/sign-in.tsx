import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { z } from 'zod';
import { Field } from '@/components/keel/Field';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { isDemoMode } from '@/lib/repo';
import { spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

export default function SignIn() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const signIn = useSession((s) => s.signIn);
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const session = await signIn(values.email.trim(), values.password);
      router.replace(session.role === 'org' ? '/(org)' : '/(teen)');
    } catch (e) {
      setServerError(e instanceof Error ? e.message : t('common.error'));
    }
  });

  return (
    <Screen>
      <SectionHeader title={t('auth.signIn')} />
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
      <PrimaryButton title={t('auth.signIn')} onPress={submit} loading={formState.isSubmitting} />
      <PrimaryButton
        title={t('auth.needAccount')}
        variant="ghost"
        onPress={() => router.replace('/(auth)/sign-up')}
        style={{ marginTop: spacing.md }}
      />
      {isDemoMode ? (
        <Text style={[type.small, { color: colors.textFaint, marginTop: spacing.xl }]}>
          Demo accounts: demo.teen@example.com / demo1234 · demo.counselor@example.com / demo1234
        </Text>
      ) : null}
    </Screen>
  );
}
