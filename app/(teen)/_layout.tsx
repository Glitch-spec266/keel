import { Redirect, Tabs } from 'expo-router';
import { CalendarDays, HandHeart, Home, TrendingUp, UserRound } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

export default function TeenLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const session = useSession((s) => s.session);
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (session.role !== 'teen') return <Redirect href="/(org)" />;

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
        options={{ title: t('tabs.today'), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="schedule"
        options={{ title: t('tabs.schedule'), tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="support"
        options={{ title: t('tabs.support'), tabBarIcon: ({ color, size }) => <HandHeart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="impact"
        options={{ title: t('tabs.impact'), tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tabs>
  );
}
