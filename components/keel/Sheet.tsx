import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, type } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode };

// Bottom-sheet wrapper. Uses a plain Modal slide-up (web-safe, reduced-motion friendly)
// instead of gesture-driven @gorhom/bottom-sheet — calm, predictable, keyboard-aware.
export function Sheet({ visible, onClose, title, children }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close sheet" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.avoid} pointerEvents="box-none">
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.glassBorder, paddingBottom: insets.bottom + spacing.xl },
          ]}>
          <View style={[styles.grabber, { backgroundColor: colors.hairline }]} />
          {title ? (
            <Text style={[type.title, { color: colors.text, marginBottom: spacing.lg }]} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,23,26,0.45)' },
  avoid: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    maxHeight: '88%',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.lg },
});
