import { StyleSheet, Text, View } from 'react-native';

import { Banner, Card, EmptyState, Screen } from '@/components/common';
import { HomeHeader } from '@/components/common/HomeHeader';
import { colors, radius, spacing, typography } from '@/theme';

const SUGGESTIONS = [
  { icon: '🚗', label: 'Ride' },
  { icon: '🛺', label: 'Auto' },
  { icon: '🏍️', label: 'Bike' },
];

export function CustomerHomeScreen() {
  return (
    <Screen scroll>
      <HomeHeader subtitle="Where are you going today?" />

      {/* Map + pickup/destination search arrive in Phase 2 (booking). */}
      <View style={styles.search} accessibilityRole="search">
        <View style={styles.dot} />
        <Text style={styles.searchText}>Where to?</Text>
      </View>

      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <View key={s.label} style={styles.suggestion}>
            <Text style={styles.suggestionIcon}>{s.icon}</Text>
            <Text style={styles.suggestionLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Banner tone="info">Ride booking with maps is coming in the next phase.</Banner>

      <Card>
        <Text style={styles.sectionTitle}>Recent rides</Text>
        <EmptyState title="No rides yet" message="Your completed trips will show up here." />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    height: 56,
    marginTop: spacing.sm,
  },
  dot: { width: 10, height: 10, backgroundColor: colors.black },
  searchText: { ...typography.heading, color: colors.textMuted },
  suggestions: { flexDirection: 'row', gap: spacing.md },
  suggestion: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  suggestionIcon: { fontSize: 30 },
  suggestionLabel: { ...typography.bodyStrong, color: colors.text },
  sectionTitle: { ...typography.heading, color: colors.text },
});
