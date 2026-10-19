import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField } from '@/components/common';
import { ROLES, type SelfAssignableRole } from '@/constants/roles';
import { useAsync } from '@/hooks/useAsync';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme';

const ROLE_OPTIONS: { role: SelfAssignableRole; title: string; description: string; icon: string }[] = [
  { role: ROLES.CUSTOMER, title: 'Ride', description: 'Book rides to wherever you need to go', icon: '🧍' },
  { role: ROLES.DRIVER, title: 'Drive', description: 'Earn by giving rides with your vehicle', icon: '🚗' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<SelfAssignableRole>(ROLES.CUSTOMER);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const logout = useAuthStore((s) => s.logout);

  const emailError = email && !EMAIL_RE.test(email) ? 'Enter a valid email' : null;
  const canSubmit = name.trim().length >= 2 && !emailError;

  const { run, loading, error } = useAsync(async () => {
    const res = await userService.completeOnboarding({
      name: name.trim(),
      role,
      email: email.trim() || undefined,
    });
    completeOnboarding(res);
  });

  return (
    <Screen scroll footer={<Button title="Get started" onPress={run} loading={loading} disabled={!canSubmit} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself.</Text>
      </View>

      <TextField
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Ravi Krishna"
        autoCapitalize="words"
        autoComplete="name"
        autoFocus
      />
      <TextField
        label="Email (optional)"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={emailError}
      />

      <Text style={styles.sectionLabel}>HOW WILL YOU USE RIDEBOOK?</Text>
      <View style={styles.roles}>
        {ROLE_OPTIONS.map((opt) => {
          const selected = role === opt.role;
          return (
            <Pressable
              key={opt.role}
              onPress={() => setRole(opt.role)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.roleCard, selected && styles.roleSelected]}
            >
              <Text style={styles.roleIcon}>{opt.icon}</Text>
              <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>{opt.title}</Text>
              <Text style={[styles.roleDesc, selected && styles.roleDescSelected]}>{opt.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={logout} hitSlop={8}>
        <Text style={styles.link}>Use a different number</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginTop: spacing.lg },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginTop: spacing.sm },
  roles: { flexDirection: 'row', gap: spacing.md },
  roleCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    backgroundColor: colors.white,
  },
  roleSelected: { borderColor: colors.black, backgroundColor: colors.black },
  roleIcon: { fontSize: 28 },
  roleTitle: { ...typography.heading, color: colors.text },
  roleTitleSelected: { color: colors.white },
  roleDesc: { ...typography.caption, color: colors.textMuted },
  roleDescSelected: { color: '#CFCFCF' },
  error: { ...typography.caption, color: colors.danger },
  link: { ...typography.bodyStrong, color: colors.accent },
});
