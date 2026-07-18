import { Check } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryColors, radius, shadow, spacing, touch, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { CategoryBadge } from './CategoryBadge';

type Props = {
  title: string;
  kind: 'medication' | 'appointment' | 'task';
  kindLabel: string;
  timeLabel?: string;
  dose?: string | null;
  recipientAlias?: string | null;
  done?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
};

// A care task row with a checkable ring on the left.
export function TaskCard({ title, kind, kindLabel, timeLabel, dose, recipientAlias, done, onToggle, onPress }: Props) {
  const { colors } = useTheme();
  const accent = categoryColors[kind] ?? colors.primary;
  const meta = [timeLabel, dose, recipientAlias].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${meta ? ', ' + meta : ''}${done ? ', completed' : ''}`}
      style={({ pressed }) => [
        styles.wrap,
        shadow.card,
        { backgroundColor: colors.surface, borderColor: colors.hairline, opacity: pressed ? 0.92 : 1 },
      ]}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!done }}
        accessibilityLabel={done ? 'Mark not done' : 'Mark done'}
        style={[styles.ring, { borderColor: done ? accent : colors.hairline, backgroundColor: done ? accent : 'transparent' }]}>
        {done ? (
          <MotiView from={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'timing', duration: 180 }}>
            <Check size={18} color="#fff" strokeWidth={3} />
          </MotiView>
        ) : null}
      </Pressable>
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={[type.bodyBold, { color: colors.text }, done && { textDecorationLine: 'line-through', color: colors.textFaint }]}
          numberOfLines={1}>
          {title}
        </Text>
        {meta ? (
          <Text style={[type.small, { color: colors.textMuted }]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      <CategoryBadge category={kind} label={kindLabel} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    minHeight: touch.minTarget + 16,
  },
  ring: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
