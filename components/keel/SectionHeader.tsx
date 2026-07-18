import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <Text style={[type.heading, { color: colors.text }]}>{title}</Text>
      {hint ? <Text style={[type.small, { color: colors.textMuted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
