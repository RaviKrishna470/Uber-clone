import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  prefix?: ReactNode;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

export function TextField({ label, error, hint, prefix, style, onFocus, onBlur, ref, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.focused, !!error && styles.errored]}>
        {prefix}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs + 2 },
  label: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.surface,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
    gap: spacing.sm,
  },
  focused: { borderColor: colors.black, backgroundColor: colors.white },
  errored: { borderColor: colors.danger },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  error: { ...typography.caption, color: colors.danger },
  hint: { ...typography.caption, color: colors.textMuted },
});
