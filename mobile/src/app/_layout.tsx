import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Loader } from '@/components/common';
import { selectIsCustomer, selectIsDriver, useAuthStore } from '@/store/authStore';

/**
 * Route guards (client-side convenience only — the backend enforces RBAC on every request).
 * When a guard flips (login, onboarding, logout, session expiry) the user is sent back to `index`,
 * which redirects to the right place.
 */
export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const isCustomer = useAuthStore(selectIsCustomer);
  const isDriver = useAuthStore(selectIsDriver);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (status === 'loading') return <Loader />;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />

        <Stack.Protected guard={status === 'guest'}>
          <Stack.Screen name="login" />
          <Stack.Screen name="otp" />
        </Stack.Protected>

        <Stack.Protected guard={status === 'onboarding'}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={isCustomer}>
          <Stack.Screen name="(customer)" />
        </Stack.Protected>

        <Stack.Protected guard={isDriver}>
          <Stack.Screen name="(driver)" />
        </Stack.Protected>

        <Stack.Protected guard={status === 'ready'}>
          <Stack.Screen name="profile" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
