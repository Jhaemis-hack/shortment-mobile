import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, font, radius, spacing } from "../theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  /** Renders a masked input with a show/hide toggle. */
  password?: boolean;
}

/** Labelled input with error/hint text. */
const TextField = ({ label, error, hint, password, style, ...rest }: TextFieldProps) => {
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.control, focused && styles.focused, error ? styles.invalid : null]}
      >
        <TextInput
          placeholderTextColor={colors.subtle}
          autoCapitalize={password ? "none" : rest.autoCapitalize}
          {...rest}
          secureTextEntry={password && !revealed}
          accessibilityLabel={label}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, style]}
        />
        {password && (
          <Pressable
            onPress={() => setRevealed(prev => !prev)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            hitSlop={8}
          >
            <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: spacing.xs, alignSelf: "stretch" },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.ink },
  control: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  focused: { borderColor: colors.brand },
  invalid: { borderColor: colors.danger },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: font.size.md, color: colors.ink },
  error: { fontSize: font.size.xs, color: colors.danger },
  hint: { fontSize: font.size.xs, color: colors.muted },
});

export default TextField;
