import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
}

/** One hidden input drives N visual boxes — supports paste and SMS autofill. */
export function OtpInput({ value, onChange, length = 6, error, autoFocus = true }: Props) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessibilityLabel="One-time code">
      <View style={styles.row}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              i === activeIndex && value.length < length && styles.active,
              !!value[i] && styles.filled,
              error && styles.error,
            ]}
          >
            <Text style={styles.digit}>{value[i] ?? ''}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        testID="otp-input"
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  cell: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { borderColor: colors.black, backgroundColor: colors.white },
  filled: { backgroundColor: colors.white, borderColor: colors.border },
  error: { borderColor: colors.danger },
  digit: { fontSize: 24, fontWeight: '700', color: colors.text },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
