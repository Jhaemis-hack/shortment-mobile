import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colors, font, radius, spacing } from "../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Optional leading element, e.g. an icon. */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const Button = ({
  children,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  icon,
  style,
  accessibilityLabel,
}: ButtonProps) => {
  const inactive = disabled || loading;
  const tone = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizes[size],
        { backgroundColor: pressed ? tone.pressed : tone.bg, borderColor: tone.border },
        fullWidth && styles.fullWidth,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={tone.fg} /> : icon}
      {typeof children === "string" ? (
        <Text style={[styles.label, { color: tone.fg, fontSize: labelSizes[size] }]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const variants: Record<Variant, { bg: string; pressed: string; fg: string; border: string }> = {
  primary: { bg: colors.brand, pressed: colors.brandHover, fg: colors.surface, border: colors.brand },
  secondary: { bg: colors.surface, pressed: colors.brandSoft, fg: colors.brand, border: colors.brand },
  ghost: { bg: "transparent", pressed: colors.brandSoft, fg: colors.brand, border: "transparent" },
  danger: { bg: colors.danger, pressed: "#b53939", fg: colors.surface, border: colors.danger },
};

const sizes = StyleSheet.create({
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
});

const labelSizes: Record<Size, number> = { sm: font.size.sm, md: font.size.md, lg: font.size.lg };

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  fullWidth: { alignSelf: "stretch" },
  inactive: { opacity: 0.55 },
  label: { fontWeight: font.weight.semibold },
});

export default Button;
