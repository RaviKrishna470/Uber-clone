import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField } from '@/components/common';
import { VEHICLE_TYPES, type VehicleType } from '@/constants/roles';
import { useAsync } from '@/hooks/useAsync';
import { driverService } from '@/services/driver.service';
import { colors, radius, spacing, typography } from '@/theme';

export function DriverRegistrationScreen() {
  const [license, setLicense] = useState('');
  const [registration, setRegistration] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const [makeModel, setMakeModel] = useState('');
  const [color, setColor] = useState('');

  const canSubmit = license.trim().length >= 5 && registration.replace(/\s/g, '').length >= 4;

  const { run, loading, error } = useAsync(async () => {
    await driverService.apply({
      license_number: license.trim(),
      vehicle: {
        registration_number: registration.trim(),
        vehicle_type: vehicleType,
        make_model: makeModel.trim() || undefined,
        color: color.trim() || undefined,
      },
    });
    router.back();
  });

  return (
    <Screen scroll footer={<Button title="Submit for approval" onPress={run} loading={loading} disabled={!canSubmit} />}>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.back}>←  Back</Text>
      </Pressable>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicle registration</Text>
        <Text style={styles.subtitle}>An admin reviews every driver before they can accept rides.</Text>
      </View>

      <TextField
        label="Driving licence number"
        value={license}
        onChangeText={setLicense}
        autoCapitalize="characters"
        placeholder="KA0120260001234"
      />

      <Text style={styles.sectionLabel}>VEHICLE TYPE</Text>
      <View style={styles.chips}>
        {VEHICLE_TYPES.map((t) => {
          const selected = t.value === vehicleType;
          return (
            <Pressable
              key={t.value}
              onPress={() => setVehicleType(t.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextField
        label="Registration number"
        value={registration}
        onChangeText={setRegistration}
        autoCapitalize="characters"
        placeholder="KA 01 AB 1234"
      />
      <TextField label="Make & model (optional)" value={makeModel} onChangeText={setMakeModel} placeholder="Maruti Dzire" />
      <TextField label="Colour (optional)" value={color} onChangeText={setColor} placeholder="White" />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { ...typography.bodyStrong, color: colors.text },
  header: { gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  sectionLabel: { ...typography.label, color: colors.textMuted },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.black },
  chipText: { ...typography.bodyStrong, color: colors.text },
  chipTextSelected: { color: colors.white },
  error: { ...typography.caption, color: colors.danger },
});
