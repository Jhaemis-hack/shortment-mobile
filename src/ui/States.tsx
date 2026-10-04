import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View, type DimensionValue } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "./Button";
import { useSlowHint } from "../hooks/useSlowHint";
import { colors, font, radius, spacing } from "../theme";

/**
 * Shown after a few seconds of loading. The hosted API sleeps when idle, so the
 * first request can take up to a minute while it starts.
 */
export const SlowHint = () => {
  const slow = useSlowHint();
  if (!slow) return null;
  return <Text style={styles.hint}>Waking up the server, this can take up to a minute the first time…</Text>;
};

export const Spinner = ({ label = "Loading…" }: { label?: string }) => (
  <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel={label}>
    <ActivityIndicator size="large" color={colors.brand} />
    <Text style={styles.text}>{label}</Text>
    <SlowHint />
  </View>
);

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const EmptyState = ({ title, description, action, icon = "file-tray-outline" }: EmptyStateProps) => (
  <View style={styles.state}>
    <View style={styles.icon}>
      <Ionicons name={icon} size={28} color={colors.brand} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.text}>{description}</Text> : null}
    {action}
  </View>
);

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message = "Something went wrong. Please try again.", onRetry }: ErrorStateProps) => (
  <View style={styles.state} accessibilityRole="alert">
    <View style={[styles.icon, styles.dangerIcon]}>
      <Ionicons name="alert-circle-outline" size={28} color={colors.danger} />
    </View>
    <Text style={styles.title}>We couldn&apos;t load this</Text>
    <Text style={styles.text}>{message}</Text>
    {onRetry && (
      <Button variant="secondary" onPress={onRetry} style={styles.centered}>
        Try again
      </Button>
    )}
  </View>
);

/** Grey placeholder block shown while content loads. */
export const Skeleton = ({ width = "100%", height = 16 }: { width?: DimensionValue; height?: number }) => (
  <View style={[styles.skeleton, { width, height }]} />
);

const styles = StyleSheet.create({
  state: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerIcon: { backgroundColor: colors.dangerSoft },
  title: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink, textAlign: "center" },
  text: { fontSize: font.size.sm, color: colors.muted, textAlign: "center" },
  hint: { fontSize: font.size.xs, color: colors.subtle, textAlign: "center" },
  centered: { alignSelf: "center" },
  skeleton: { backgroundColor: colors.line, borderRadius: radius.sm },
});
