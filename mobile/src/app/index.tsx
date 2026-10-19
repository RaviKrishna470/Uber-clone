import { Redirect } from 'expo-router';

import { NoAccessScreen } from '@/screens/shared/NoAccessScreen';
import { selectIsCustomer, selectIsDriver, useAuthStore } from '@/store/authStore';

/** Entry/anchor route: sends the user to the screen that matches their session and role. */
export default function Index() {
  const status = useAuthStore((s) => s.status);
  const isCustomer = useAuthStore(selectIsCustomer);
  const isDriver = useAuthStore(selectIsDriver);

  if (status === 'guest') return <Redirect href="/login" />;
  if (status === 'onboarding') return <Redirect href="/onboarding" />;
  if (isCustomer) return <Redirect href="/home" />;
  if (isDriver) return <Redirect href="/dashboard" />;
  return <NoAccessScreen />;
}
