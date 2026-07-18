import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import { radius, shadow, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

// Glass is reserved for hero surfaces (home summary, sheets, emergency card) — not everywhere.
export function GlassCard({ style, children, ...rest }: ViewProps) {
  const { colors, dark } = useTheme();
  const inner = (
    <View style={[styles.inner, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
      {children}
    </View>
  );
  if (Platform.OS === 'web') {
    // expo-blur renders backdrop-filter on web but can flicker; a translucent card + blur CSS is enough.
    return (
      <View
        {...rest}
        style={[styles.wrap, shadow.soft, style, { backdropFilter: 'blur(24px)' } as object]}>
        {inner}
      </View>
    );
  }
  return (
    <View {...rest} style={[styles.wrap, shadow.soft, style]}>
      <BlurView intensity={40} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: 'hidden' },
  inner: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.xl },
});
