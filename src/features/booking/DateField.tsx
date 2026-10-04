import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import RNDateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDate } from "../../lib/format";
import { colors, font, radius, spacing } from "../../theme";
import { fromIso, toIso } from "./dates";

interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD or "" when not chosen. */
  value: string;
  /** Earliest selectable date, YYYY-MM-DD. */
  minimum: string;
  onChange: (value: string) => void;
}

/** A tappable field that opens the native date picker. */
const DateField = ({ label, value, minimum, onChange }: DateFieldProps) => {
  const [iosOpen, setIosOpen] = useState(false);
  const current = fromIso(value && value >= minimum ? value : minimum);

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value: current,
        minimumDate: fromIso(minimum),
        onValueChange: (_event, date) => onChange(toIso(date)),
      });
    } else {
      setIosOpen(prev => !prev);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatDate(value) : "not set"}`}
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        <Text style={[styles.value, !value && styles.placeholder]}>{value ? formatDate(value) : "Add date"}</Text>
      </Pressable>
      {iosOpen && Platform.OS !== "android" ? (
        <RNDateTimePicker
          mode="date"
          display="inline"
          value={current}
          minimumDate={fromIso(minimum)}
          onValueChange={(_event, date) => {
            setIosOpen(false);
            onChange(toIso(date));
          }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { flex: 1, gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.ink },
  control: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  pressed: { borderColor: colors.brand },
  value: { fontSize: font.size.md, color: colors.ink },
  placeholder: { color: colors.subtle },
});

export default DateField;
