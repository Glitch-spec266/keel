import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { radius, spacing, touch, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = TextInputProps & { label: string; error?: string };

export function Field({ label, error, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6, marginBottom: spacing.lg }}>
      <Text style={[type.smallBold, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textFaint}
        {...rest}
        style={[
          styles.input,
          type.body,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.hairline,
          },
          style,
        ]}
      />
      {error ? <Text style={[type.small, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: touch.minTarget + 4,
    borderRadius: radius.md,
    borderWidth: 1.2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
