import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Library, Send, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryBadge } from '@/components/keel/CategoryBadge';
import { Chips } from '@/components/keel/Chips';
import { EmptyState } from '@/components/keel/EmptyState';
import { Field } from '@/components/keel/Field';
import { PrimaryButton } from '@/components/keel/PrimaryButton';
import { Screen } from '@/components/keel/Screen';
import { SectionHeader } from '@/components/keel/SectionHeader';
import { Sheet } from '@/components/keel/Sheet';
import { repo } from '@/lib/repo';
import { useMyOrg } from '@/lib/hooks';
import type { Resource, ResourceCategory } from '@/lib/types';
import { radius, shadow, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const CATEGORIES: ResourceCategory[] = ['respite', 'food', 'mental_health', 'legal', 'financial', 'training'];

export default function OrgResources() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const org = useMyOrg();
  const orgId = org.data?.id ?? '';
  const qc = useQueryClient();

  const resources = useQuery({ queryKey: ['resources'], queryFn: () => repo.listResources() });
  const students = useQuery({
    queryKey: ['orgStudents', orgId],
    queryFn: () => repo.orgStudents(orgId),
    enabled: !!orgId,
  });

  const [editorOpen, setEditorOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('respite');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [shareTarget, setShareTarget] = useState<Resource | null>(null);
  const [sharedTo, setSharedTo] = useState<Set<string>>(new Set());

  const invalidate = () => qc.invalidateQueries({ queryKey: ['resources'] });
  const save = useMutation({
    mutationFn: () =>
      repo.upsertResource(orgId, {
        title: title.trim(),
        category,
        description: description.trim() || null,
        url: url.trim() || null,
        location: location.trim() || null,
        district: org.data?.district ?? null,
      }),
    onSuccess: () => {
      invalidate();
      setEditorOpen(false);
      setTitle(''); setDescription(''); setUrl(''); setLocation('');
    },
  });
  const remove = useMutation({ mutationFn: (id: string) => repo.deleteResource(id), onSuccess: invalidate });
  const share = useMutation({
    mutationFn: ({ teenId, resourceId }: { teenId: string; resourceId: string }) =>
      repo.shareResourceToTeen(orgId, teenId, resourceId),
    onSuccess: (_d, vars) => setSharedTo((s) => new Set(s).add(vars.teenId)),
  });

  const mine = (resources.data ?? []).filter((r) => r.org_id === orgId);

  return (
    <Screen>
      <SectionHeader title={t('org.resourceManager')} hint={org.data?.name} />
      {mine.length === 0 ? (
        <EmptyState icon={<Library size={24} color={colors.primary} />} title={t('org.addResource')} />
      ) : (
        <View style={{ gap: spacing.md }}>
          {mine.map((r) => (
            <View key={r.id} style={[styles.card, shadow.card, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <CategoryBadge category={r.category} label={t(`support.categories.${r.category}`)} />
                <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                  <Pressable
                    onPress={() => { setSharedTo(new Set()); setShareTarget(r); }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('org.pushResource')}: ${r.title}`}>
                    <Send size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => remove.mutate(r.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('common.delete')} ${r.title}`}>
                    <Trash2 size={18} color={colors.textFaint} />
                  </Pressable>
                </View>
              </View>
              <Text style={[type.bodyBold, { color: colors.text }]}>{r.title}</Text>
              {r.description ? <Text style={[type.small, { color: colors.textMuted }]}>{r.description}</Text> : null}
            </View>
          ))}
        </View>
      )}
      <PrimaryButton title={t('org.addResource')} style={{ marginTop: spacing.xl }} onPress={() => setEditorOpen(true)} />

      {/* resource editor */}
      <Sheet visible={editorOpen} onClose={() => setEditorOpen(false)} title={t('org.addResource')}>
        <Field label={t('schedule.taskTitle')} value={title} onChangeText={setTitle} />
        <Text style={[type.smallBold, { color: colors.textMuted, marginBottom: 6 }]}>{t('schedule.kind')}</Text>
        <View style={{ marginBottom: spacing.lg }}>
          <Chips
            value={category}
            onChange={(v) => setCategory(v as ResourceCategory)}
            options={CATEGORIES.map((c) => ({ value: c, label: t(`support.categories.${c}`) }))}
          />
        </View>
        <Field label="Description" value={description} onChangeText={setDescription} multiline />
        <Field label="URL" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" />
        <Field label="Location" value={location} onChangeText={setLocation} />
        <PrimaryButton title={t('common.save')} disabled={!title.trim()} loading={save.isPending} onPress={() => save.mutate()} />
      </Sheet>

      {/* push to a consented student */}
      <Sheet visible={!!shareTarget} onClose={() => setShareTarget(null)} title={t('org.shareWith')}>
        {(students.data ?? []).length === 0 ? (
          <Text style={[type.body, { color: colors.textMuted }]}>{t('org.noStudents')}</Text>
        ) : (
          <View style={{ gap: spacing.md }}>
            {(students.data ?? []).map((s) => (
              <View key={s.profile.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text style={[type.bodyBold, { color: colors.text, flex: 1 }]}>
                  {s.profile.display_name ?? s.profile.handle}
                </Text>
                <PrimaryButton
                  title={sharedTo.has(s.profile.id) ? t('org.shared') : t('org.pushResource')}
                  variant={sharedTo.has(s.profile.id) ? 'ghost' : 'primary'}
                  style={{ minHeight: 40, paddingVertical: 6 }}
                  onPress={() =>
                    shareTarget && share.mutate({ teenId: s.profile.id, resourceId: shareTarget.id })
                  }
                />
              </View>
            ))}
          </View>
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.sm },
});
