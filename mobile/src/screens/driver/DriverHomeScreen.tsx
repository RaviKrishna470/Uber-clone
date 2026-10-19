import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, BarChart, Button, Card, EmptyState, Loader, StatCard, StatusBadge } from '@/components/common';
import { HomeHeader } from '@/components/common/HomeHeader';
import { AVAILABILITY, DRIVER_APPROVAL } from '@/constants/roles';
import { useAsync } from '@/hooks/useAsync';
import { driverService } from '@/services/driver.service';
import { colors, spacing, typography } from '@/theme';
import type { DriverProfile } from '@/types/driver';
import { AppError, getErrorMessage } from '@/utils/appError';
import { formatPaise } from '@/utils/format';

const approvalTone = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', SUSPENDED: 'danger' } as const;

// Earnings come from completed rides (Phase 3+). Until then the chart shows the week with zero values.
const EMPTY_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => ({ label, value: 0 }));

export function DriverHomeScreen() {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setDriver(await driverService.getMyProfile());
      setLoadState('ready');
    } catch (e) {
      if (e instanceof AppError && e.status === 404) {
        setLoadState('missing');
      } else {
        setLoadError(getErrorMessage(e));
        setLoadState('error');
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggle = useAsync(async (online: boolean) => {
    setDriver(await driverService.setAvailability(online ? AVAILABILITY.ONLINE : AVAILABILITY.OFFLINE));
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loadState === 'loading') return <Loader />;

  if (loadState === 'missing') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.pad}>
          <HomeHeader subtitle="Let's get you on the road" />
        </View>
        <EmptyState
          title="Register your vehicle"
          message="Add your driving licence and vehicle details. An admin will review and approve your profile."
          action={
            <Button title="Start registration" onPress={() => router.push('/register')} style={{ alignSelf: 'stretch' }} />
          }
        />
      </SafeAreaView>
    );
  }

  if (loadState === 'error' || !driver) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState title="Couldn't load your profile" message={loadError ?? undefined} action={<Button title="Retry" onPress={load} />} />
      </SafeAreaView>
    );
  }

  const approved = driver.approval_status === DRIVER_APPROVAL.APPROVED;
  const online = driver.availability_status === AVAILABILITY.ONLINE;
  const vehicle = driver.active_vehicle;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.pad, styles.content]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <HomeHeader subtitle={online ? "You're online" : "You're offline"} />

        {!approved && (
          <Banner tone={driver.approval_status === DRIVER_APPROVAL.PENDING ? 'warning' : 'danger'}>
            {driver.approval_status === DRIVER_APPROVAL.PENDING
              ? 'Your profile is under review. You can go online once an admin approves it. Pull down to refresh.'
              : `Your driver profile is ${driver.approval_status.toLowerCase()}. Contact support for help.`}
          </Banner>
        )}

        <Card style={online ? styles.onlineCard : undefined}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.toggleTitle, online && styles.onlineText]}>{online ? 'Online' : 'Offline'}</Text>
              <Text style={[styles.muted, online && styles.onlineSub]}>
                {online ? 'You will receive ride requests nearby' : 'Go online to start receiving rides'}
              </Text>
            </View>
            <Switch
              testID="availability-switch"
              value={online}
              onValueChange={(v) => toggle.run(v)}
              disabled={!approved || toggle.loading}
              trackColor={{ true: colors.success, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
          {toggle.error ? <Text style={styles.error}>{toggle.error}</Text> : null}
        </Card>

        <View style={styles.stats}>
          <StatCard label="Today's trips" value={0} />
          <StatCard label="Today's earnings" value={formatPaise(0)} />
        </View>

        <Card>
          <BarChart title="This week" data={EMPTY_WEEK} formatValue={(v) => formatPaise(v)} />
        </Card>

        <Card>
          <View style={styles.vehicleHeader}>
            <Text style={styles.sectionTitle}>Your vehicle</Text>
            <StatusBadge label={driver.approval_status} tone={approvalTone[driver.approval_status]} />
          </View>
          {vehicle ? (
            <View style={{ gap: 2 }}>
              <Text style={styles.plate}>{vehicle.registration_number}</Text>
              <Text style={styles.muted}>
                {[vehicle.make_model, vehicle.color, vehicle.vehicle_type].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ) : (
            <Text style={styles.muted}>No active vehicle</Text>
          )}
          <Text style={styles.muted}>Licence: {driver.license_number}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pad: { padding: spacing.xl },
  content: { gap: spacing.lg },
  onlineCard: { backgroundColor: colors.black },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleTitle: { ...typography.heading, color: colors.text },
  onlineText: { color: colors.white },
  onlineSub: { color: '#CFCFCF' },
  muted: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.caption, color: colors.danger },
  stats: { flexDirection: 'row', gap: spacing.md },
  sectionTitle: { ...typography.heading, color: colors.text },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plate: { ...typography.title, letterSpacing: 1, color: colors.text },
});
