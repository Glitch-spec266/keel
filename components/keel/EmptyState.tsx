import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { PrimaryButton } from './PrimaryButton';

type Props = { icon?: React.ReactNode; title: string; body?: string; actionTitle?: string; onAction?: () => void };

export function EmptyState({ icon, title, body, actionTitle, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
      {icon}
      <Text style={[type.heading, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
      {body ? (
        <Text style={[type.body, { color: colors.textMuted, textAlign: 'center' }]}>{body}</Text>
      ) : null}
      {actionTitle && onAction ? (
        <PrimaryButton title={actionTitle} onPress={onAction} style={{ marginTop: spacing.sm }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
});
