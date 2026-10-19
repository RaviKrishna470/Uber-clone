import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Banner, Button, OtpInput, Screen } from '@/components/common';
import { OTP_LENGTH } from '@/constants/config';
import { useAsync } from '@/hooks/useAsync';
import { useCountdown } from '@/hooks/useCountdown';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme';
import { formatPhone } from '@/utils/phone';

export function OtpVerifyScreen() {
  const params = useLocalSearchParams<{ phone: string; resendAfter?: string; devCode?: string }>();
  const phone = params.phone ?? '';
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(params.devCode || '');
  const signIn = useAuthStore((s) => s.signIn);
  const countdown = useCountdown(Number(params.resendAfter ?? 30));

  const verify = useAsync(async (value: string) => {
    const auth = await authService.verifyOtp(phone, value);
    // The root layout's route guards move the user to onboarding or their home screen.
    await signIn(auth);
  });

  const resend = useAsync(async () => {
    const res = await authService.requestOtp(phone);
    setCode('');
    setDevCode(res.dev_code ?? '');
    countdown.restart(res.resend_after);
  });

  // Auto-submit once all digits are entered.
  useEffect(() => {
    if (code.length === OTP_LENGTH) verify.run(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const error = verify.error ?? resend.error;

  return (
    <Screen
      footer={
        <Button
          title="Verify"
          onPress={() => verify.run(code)}
          loading={verify.loading}
          disabled={code.length !== OTP_LENGTH}
          testID="otp-verify"
        />
      }
    >
      <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
        <Text style={styles.back}>←  Change number</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Enter the 6-digit code</Text>
        <Text style={styles.subtitle}>Sent to {formatPhone(phone)}</Text>
      </View>

      {__DEV__ && devCode ? <Banner tone="info">Dev mode (mock OTP): your code is {devCode}</Banner> : null}

      <OtpInput
        value={code}
        onChange={(v) => {
          setCode(v);
          if (verify.error) verify.setError(null);
        }}
        length={OTP_LENGTH}
        error={!!verify.error}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.resendRow}>
        {countdown.done ? (
          <Pressable onPress={() => resend.run()} disabled={resend.loading} hitSlop={8}>
            <Text style={styles.resendLink}>{resend.loading ? 'Sending…' : 'Resend code'}</Text>
          </Pressable>
        ) : (
          <Text style={styles.resendWait}>Resend code in 0:{String(countdown.seconds).padStart(2, '0')}</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { ...typography.bodyStrong, color: colors.text, paddingTop: spacing.sm },
  header: { gap: spacing.sm, marginTop: spacing.md },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  error: { ...typography.caption, color: colors.danger },
  resendRow: { alignItems: 'flex-start' },
  resendLink: { ...typography.bodyStrong, color: colors.accent },
  resendWait: { ...typography.body, color: colors.textMuted },
});
