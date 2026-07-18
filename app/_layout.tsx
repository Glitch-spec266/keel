import '@/lib/i18n';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LockKeyhole } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { onNotificationTap } from '@/lib/notifications';
import { spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
});

function LockScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const unlock = useSession((s) => s.unlock);
  useEffect(() => {
    unlock();
  }, [unlock]);
  return (
    <View style={[styles.lock, { backgroundColor: colors.background }]}>
      <LockKeyhole size={44} color={colors.primary} />
      <Text style={[type.title, { color: colors.text }]}>{t('appName')}</Text>
      <PrimaryButton title={t('auth.unlock')} onPress={() => unlock()} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });
  const { dark, colors } = useTheme();
  const { ready, locked, init } = useSession();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => onNotificationTap(() => router.push('/(teen)/schedule')), []);

  if (!fontsLoaded || !ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          {locked ? (
            <LockScreen />
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  lock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
});
