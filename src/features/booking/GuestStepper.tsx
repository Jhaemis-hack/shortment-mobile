import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { pluralize } from "../../lib/format";
import { colors, font, radius, spacing } from "../../theme";

interface GuestStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

const StepButton = ({ icon, label, disabled, onPress }: { icon: "remove" | "add"; label: string; disabled: boolean; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    hitSlop={6}
    style={({ pressed }) => [styles.step, pressed && styles.pressed, disabled && styles.disabled]}
  >
    <Ionicons name={icon} size={20} color={colors.brand} />
  </Pressable>
);

/** Guests count, 1..max. */
const GuestStepper = ({ value, max, onChange }: GuestStepperProps) => (
  <View style={styles.row}>
    <View style={styles.text}>
      <Text style={styles.label}>Guests</Text>
      <Text style={styles.hint}>Up to {pluralize(max, "guest")}</Text>
    </View>
    <View style={styles.controls} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max, now: value }}>
      <StepButton icon="remove" label="Fewer guests" disabled={value <= 1} onPress={() => onChange(value - 1)} />
      <Text style={styles.value}>{value}</Text>
      <StepButton icon="add" label="More guests" disabled={value >= max} onPress={() => onChange(value + 1)} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  text: { gap: 2 },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.ink },
  hint: { fontSize: font.size.xs, color: colors.muted },
  controls: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  step: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { backgroundColor: colors.brandSoft },
  disabled: { opacity: 0.35 },
  value: { minWidth: 24, textAlign: "center", fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
});

export default GuestStepper;
