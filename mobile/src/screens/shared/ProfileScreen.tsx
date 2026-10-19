import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Screen, StatusBadge, TextField } from '@/components/common';
import { useAsync } from '@/hooks/useAsync';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme';
import { formatPhone } from '@/utils/phone';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const save = useAsync(async () => {
    const updated = await userService.updateMe({ name: name.trim(), email: email.trim() || null });
    setUser(updated);
  });
  const signOut = useAsync(logout);

  if (!user) return null;
  const dirty = name.trim() !== (user.name ?? '') || email.trim() !== (user.email ?? '');

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.back}>←  Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Avatar name={user.name} size={72} />
        <View style={{ gap: 4, flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.muted}>{formatPhone(user.phone)}</Text>
          <View style={styles.badges}>
            {user.roles.map((r) => (
              <StatusBadge key={r} label={r} tone="info" />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Add an email"
        />
        {save.error ? <Text style={styles.error}>{save.error}</Text> : null}
        <Button title="Save changes" onPress={save.run} loading={save.loading} disabled={!dirty || name.trim().length < 2} />
      </View>

      <Button title="Log out" variant="danger" onPress={signOut.run} loading={signOut.loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { ...typography.bodyStrong, color: colors.text },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginVertical: spacing.md },
  name: { ...typography.title, color: colors.text },
  muted: { ...typography.body, color: colors.textMuted },
  badges: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
  error: { ...typography.caption, color: colors.danger },
  form: { gap: spacing.lg },
});
