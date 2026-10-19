import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export interface Column<T> {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyText?: string;
}

/** Compact, horizontally scrollable table for small datasets (e.g. earnings breakdown). */
export function DataTable<T extends object>({ columns, data, keyExtractor, emptyText = 'No data' }: Props<T>) {
  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.row, styles.header]}>
            {columns.map((c) => (
              <Text key={c.key} style={[styles.cell, styles.headerText, { width: c.width ?? 120, textAlign: c.align ?? 'left' }]}>
                {c.title}
              </Text>
            ))}
          </View>
          {data.length === 0 ? (
            <Text style={styles.empty}>{emptyText}</Text>
          ) : (
            data.map((row) => (
              <View key={keyExtractor(row)} style={styles.row}>
                {columns.map((c) => {
                  const content = c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '');
                  return (
                    <View key={c.key} style={[styles.cell, { width: c.width ?? 120, alignItems: alignMap[c.align ?? 'left'] }]}>
                      {typeof content === 'string' ? <Text style={styles.cellText}>{content}</Text> : content}
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const alignMap = { left: 'flex-start', right: 'flex-end', center: 'center' } as const;

const styles = StyleSheet.create({
  wrapper: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  header: { backgroundColor: colors.surface },
  cell: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, justifyContent: 'center' },
  headerText: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  cellText: { ...typography.caption, color: colors.text },
  empty: { ...typography.caption, color: colors.textMuted, padding: spacing.lg },
});
