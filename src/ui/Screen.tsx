import type { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors, font, radius, shadow, spacing } from "../theme";

interface ScreenProps {
  children: ReactNode;
  /** Wraps content in a ScrollView (default). Pass false when the child is a FlatList. */
  scroll?: boolean;
  /** Pull-to-refresh for scrolling screens. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Safe-area edges to pad. Screens under a header or tab bar usually only need the defaults. */
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}

/** Page shell: safe area, canvas background, padded (scrolling) content. */
export const Screen = ({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  edges = ["left", "right"],
  contentStyle,
}: ScreenProps) => (
  <SafeAreaView style={styles.safe} edges={edges}>
    {scroll ? (
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} /> : undefined
        }
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.fill, contentStyle]}>{children}</View>
    )}
  </SafeAreaView>
);

export const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={styles.header}>
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  fill: { flex: 1 },
  header: { gap: spacing.xs },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.ink },
  subtitle: { fontSize: font.size.md, color: colors.muted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
});
