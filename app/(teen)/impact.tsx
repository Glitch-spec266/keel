import dayjs from 'dayjs';
import { Share2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/keel/EmptyState';
import { GlassCard } from '@/components/keel/GlassCard';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { ProgressRing } from '@/components/keel/ProgressRing';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { useLogsSince } from '@/lib/hooks';
import { spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useSession } from '@/state/useSession';

export default function Impact() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const session = useSession((s) => s.session);
  const monthStart = dayjs().subtract(30, 'day').startOf('day').toISOString();
  const logs = useLogsSince(monthStart);

  const stats = useMemo(() => {
    const all = logs.data ?? [];
    const weekAgo = dayjs().subtract(7, 'day');
    const weekMin = all.filter((l) => dayjs(l.completed_at).isAfter(weekAgo)).reduce((s, l) => s + (l.minutes ?? 0), 0);
    const monthMin = all.reduce((s, l) => s + (l.minutes ?? 0), 0);
    // streak: consecutive days ending today with at least one log
    const days = new Set(all.map((l) => dayjs(l.completed_at).format('YYYY-MM-DD')));
    let streak = 0;
    for (let d = dayjs(); days.has(d.format('YYYY-MM-DD')); d = d.subtract(1, 'day')) streak++;
    return { weekMin, monthMin, streak, count: all.length };
  }, [logs.data]);

  const exportHours = async () => {
    const text =
      `Keel care hours — ${session?.displayName ?? ''}\n` +
      `Last 7 days: ${(stats.weekMin / 60).toFixed(1)} h\n` +
      `Last 30 days: ${(stats.monthMin / 60).toFixed(1)} h\n` +
      `Care actions logged: ${stats.count}\n` +
      `Generated ${dayjs().format('YYYY-MM-DD')} by Keel`;
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      alert(text);
    } else {
      await Share.share({ message: text });
    }
  };

  return (
    <Screen>
      <SectionHeader title={t('impact.title')} />
      <GlassCard>
        <View style={styles.row}>
          <ProgressRing
            progress={Math.min(1, stats.weekMin / (10 * 60))}
            label={(stats.weekMin / 60).toFixed(1)}
            sublabel="h"
            size={110}
          />
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Text style={[type.heading, { color: colors.text }]}>{t('impact.hoursWeek')}</Text>
            <Text style={[type.body, { color: colors.textMuted }]}>
              {t('impact.hoursMonth')}: {(stats.monthMin / 60).toFixed(1)} h
            </Text>
            {stats.streak > 0 ? (
              <Text style={[type.smallBold, { color: colors.primary }]}>
                {t('impact.streak', { count: stats.streak })}
              </Text>
            ) : null}
          </View>
        </View>
      </GlassCard>

      {stats.count === 0 ? (
        <View style={{ marginTop: spacing.xl }}>
          <EmptyState title={t('impact.empty')} />
        </View>
      ) : (
        <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
          <PrimaryButton title={t('impact.export')} onPress={exportHours} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center' }}>
            <Share2 size={13} color={colors.textFaint} />
            <Text style={[type.small, { color: colors.textFaint }]}>{t('impact.exportHint')}</Text>
          </View>
        </View>
      )}

      <Text style={[type.small, { color: colors.textFaint, marginTop: spacing.xxl, textAlign: 'center' }]}>
        {t('impact.reassurance')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
});
