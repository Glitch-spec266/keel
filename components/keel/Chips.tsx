import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { radius, spacing, touch, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Option = { value: string; label: string };
type Props = { options: Option[]; value: string | null; onChange: (v: string) => void; label?: string };

// Horizontal single-select chip row (task kind, category filters, recurrence…).
export function Chips({ options, value, onChange, label }: Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={label}
      contentContainerStyle={{ gap: spacing.sm, paddingVertical: 2 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.hairline,
              },
            ]}>
            <Text style={[type.smallBold, { color: active ? colors.onPrimary : colors.textMuted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: Math.max(36, touch.minTarget - 8),
    borderRadius: radius.pill,
    borderWidth: 1.2,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
});
