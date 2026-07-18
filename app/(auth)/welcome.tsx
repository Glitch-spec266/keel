import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Anchor } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '@/components/keel/GlassCard';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { isDemoMode } from '@/lib/repo';
import { palette, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Welcome() {
  const { t } = useTranslation();
  const { colors, dark } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={dark ? ['#12171A', '#14231F', '#12171A'] : ['#FAF7F2', '#E7F4EF', '#FAF7F2']}
        style={StyleSheet.absoluteFill}
      />
      <Screen scroll={false} style={styles.center}>
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.center2}>
          <View style={[styles.mark, { backgroundColor: colors.primary }]}>
            <Anchor size={34} color="#fff" strokeWidth={2.2} />
          </View>
          <Text style={[type.display, { color: colors.text, textAlign: 'center' }]}>{t('appName')}</Text>
          <Text style={[type.body, { color: colors.textMuted, textAlign: 'center', maxWidth: 420 }]}>
            {t('tagline')}
          </Text>

          <GlassCard style={{ width: '100%', maxWidth: 420, marginTop: spacing.xl }}>
            <View style={{ gap: spacing.md }}>
              <PrimaryButton title={t('auth.signUp')} onPress={() => router.push('/(auth)/sign-up')} />
              <PrimaryButton title={t('auth.haveAccount')} variant="ghost" onPress={() => router.push('/(auth)/sign-in')} />
            </View>
          </GlassCard>

          {isDemoMode ? (
            <Text style={[type.small, { color: colors.textFaint, textAlign: 'center', maxWidth: 380 }]}>
              {t('auth.demoNote')}
            </Text>
          ) : null}
          <Text style={[type.small, { color: colors.textFaint, textAlign: 'center', maxWidth: 380 }]}>
            {t('today.notAlone')}
          </Text>
        </MotiView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  center2: { alignItems: 'center', gap: spacing.lg },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.keel,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
