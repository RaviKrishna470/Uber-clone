import { Button, EmptyState, Screen } from '@/components/common';
import { useAuthStore } from '@/store/authStore';

/** Admin-only accounts use the web dashboard; the mobile app is for customers and drivers. */
export function NoAccessScreen() {
  const logout = useAuthStore((s) => s.logout);
  return (
    <Screen>
      <EmptyState
        title="Use the admin dashboard"
        message="This account has admin access only. Sign in to the web dashboard to manage the platform."
        action={<Button title="Log out" variant="ghost" onPress={logout} style={{ alignSelf: 'stretch' }} />}
      />
    </Screen>
  );
}
