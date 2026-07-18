import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = { size?: number; stroke?: number; progress: number; label?: string; sublabel?: string };

export function ProgressRing({ size = 96, stroke = 9, progress, label, sublabel }: Props) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      accessibilityLabel={sublabel ? `${label} ${sublabel}` : label}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.hairline} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - clamped)}
        />
      </Svg>
      {label ? <Text style={[type.title, { color: colors.text }]}>{label}</Text> : null}
      {sublabel ? <Text style={[type.micro, { color: colors.textMuted }]}>{sublabel}</Text> : null}
    </View>
  );
}
