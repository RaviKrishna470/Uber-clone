import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField } from '@/components/common';
import { PHONE_COUNTRY_CODE, PHONE_LOCAL_LENGTH } from '@/constants/config';
import { useAsync } from '@/hooks/useAsync';
import { authService } from '@/services/auth.service';
import { colors, spacing, typography } from '@/theme';
import { digitsOnly, isValidLocalPhone, toE164 } from '@/utils/phone';

export function PhoneLoginScreen() {
  const [digits, setDigits] = useState('');
  const valid = isValidLocalPhone(digits);

  const { run, loading, error, setError } = useAsync(async () => {
    const phone = toE164(digits);
    const res = await authService.requestOtp(phone);
    router.push({
      pathname: '/otp',
      params: { phone, resendAfter: String(res.resend_after), devCode: res.dev_code ?? '' },
    });
  });

  return (
    <Screen
      footer={
        <Button title="Continue" onPress={run} loading={loading} disabled={!valid} testID="phone-continue" />
      }
    >
      <View style={styles.brand}>
        <Text style={styles.logo}>RideBook</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>What's your phone number?</Text>
        <Text style={styles.subtitle}>We'll send you a one-time code to log in or create an account.</Text>
      </View>

      <TextField
        testID="phone-input"
        label="Mobile number"
        value={digits}
        onChangeText={(t) => {
          setDigits(digitsOnly(t).slice(0, PHONE_LOCAL_LENGTH));
          if (error) setError(null);
        }}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        placeholder="98765 43210"
        maxLength={PHONE_LOCAL_LENGTH}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => valid && run()}
        error={error}
        prefix={<Text style={styles.prefix}>🇮🇳 {PHONE_COUNTRY_CODE}</Text>}
      />

      <Text style={styles.legal}>
        By continuing you agree to receive an SMS for verification. Message and data rates may apply.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { paddingTop: spacing.lg },
  logo: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: colors.black },
  header: { gap: spacing.sm, marginTop: spacing.xl },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  prefix: { ...typography.bodyStrong, color: colors.text },
  legal: { ...typography.caption, color: colors.textSubtle },
});
