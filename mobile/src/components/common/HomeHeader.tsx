import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '@/store/authStore';
import { colors, typography } from '@/theme';
import { Avatar } from './Avatar';

/** Greeting row with avatar shortcut to /profile, shared by customer and driver homes. */
export function HomeHeader({ subtitle }: { subtitle: string }) {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.hello}>Hi, {firstName}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Pressable onPress={() => router.push('/profile')} accessibilityLabel="Open profile" hitSlop={8}>
        <Avatar name={user?.name} size={44} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  hello: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
});
