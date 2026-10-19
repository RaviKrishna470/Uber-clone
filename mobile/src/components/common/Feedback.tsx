import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export function Loader({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.black} />
      {label ? <Text style={styles.muted}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={[styles.muted, styles.centerText]}>{message}</Text> : null}
      {action}
    </View>
  );
}

type Tone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: colors.infoBg, fg: colors.info },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
};

export function Banner({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  const t = tones[tone];
  return (
    <View style={[styles.banner, { backgroundColor: t.bg }]}>
      <Text style={[styles.bannerText, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

export function StatusBadge({ label, tone = 'info' }: { label: string; tone?: Tone }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label.replace(/_/g, ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  centerText: { textAlign: 'center' },
  title: { ...typography.heading, color: colors.text },
  muted: { ...typography.body, color: colors.textMuted },
  banner: { borderRadius: radius.md, padding: spacing.md },
  bannerText: { ...typography.caption, fontWeight: '500' },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  badgeText: { ...typography.label },
});
