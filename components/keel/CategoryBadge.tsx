import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { categoryColors, radius, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function CategoryBadge({ category, label }: { category: string; label: string }) {
  const { dark } = useTheme();
  const accent = categoryColors[category] ?? categoryColors.task;
  return (
    <View
      accessibilityLabel={label}
      style={[styles.wrap, { backgroundColor: accent + (dark ? '33' : '22') }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[type.micro, { color: dark ? '#F2EFEA' : '#1E2A32', textTransform: 'uppercase' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
