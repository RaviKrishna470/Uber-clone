import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';
import { initials } from '@/utils/format';

export function Avatar({ name, size = 48 }: { name?: string | null; size?: number }) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.white, fontWeight: '700' },
});
