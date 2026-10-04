import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Option } from "../../lib/constant";
import { colors, font, radius, spacing } from "../../theme";

interface PickerFieldProps {
  label: string;
  value: string;
  options: Option[];
  /** Shown (and offered as the first choice) when no value is selected. */
  placeholder: string;
  onChange: (value: string) => void;
  /** "chip" is a compact filter pill; "field" is a labelled full-width control. */
  variant?: "chip" | "field";
}

/** A select control: shows the current choice and opens a bottom sheet of options. */
const PickerField = ({ label, value, options, placeholder, onChange, variant = "field" }: PickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find(option => option.value === value);
  const choices: Option[] = [{ value: "", label: placeholder }, ...options];

  const pick = (next: string) => {
    setOpen(false);
    if (next !== value) onChange(next);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        style={({ pressed }) => [
          variant === "chip" ? styles.chip : styles.field,
          variant === "chip" && selected && styles.chipActive,
          pressed && styles.pressed,
        ]}
      >
        {variant === "field" ? (
          <View style={styles.fieldText}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue} numberOfLines={1}>
              {selected?.label ?? placeholder}
            </Text>
          </View>
        ) : (
          <Text style={[styles.chipText, selected && styles.chipTextActive]} numberOfLines={1}>
            {selected?.label ?? label}
          </Text>
        )}
        <Ionicons name="chevron-down" size={16} color={selected && variant === "chip" ? colors.brand : colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} accessibilityRole="header">
              {label}
            </Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>
          <FlatList
            data={choices}
            keyExtractor={item => item.value || "__any"}
            renderItem={({ item }) => {
              const active = item.value === value;
              return (
                <Pressable
                  onPress={() => pick(item.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <Text style={[styles.optionText, active && styles.optionActive]}>{item.label}</Text>
                  {active && <Ionicons name="checkmark" size={20} color={colors.brand} />}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: "stretch",
  },
  fieldText: { flex: 1, gap: 2 },
  fieldLabel: { fontSize: font.size.xs, fontWeight: font.weight.medium, color: colors.muted },
  fieldValue: { fontSize: font.size.md, color: colors.ink },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: 200,
  },
  chipActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  chipText: { fontSize: font.size.sm, color: colors.ink, flexShrink: 1 },
  chipTextActive: { color: colors.brand, fontWeight: font.weight.semibold },
  backdrop: { flex: 1, backgroundColor: "rgba(16, 24, 40, 0.4)" },
  sheet: {
    maxHeight: "70%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sheetTitle: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionPressed: { backgroundColor: colors.brandSoft },
  optionText: { fontSize: font.size.md, color: colors.ink },
  optionActive: { color: colors.brand, fontWeight: font.weight.semibold },
});

export default PickerField;
