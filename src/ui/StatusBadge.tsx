import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.canvas, fg: colors.muted },
  brand: { bg: colors.brandSoft, fg: colors.brand },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

const StatusBadge = ({ tone = "neutral", children }: { tone?: Tone; children: string }) => (
  <View style={[styles.badge, { backgroundColor: tones[tone].bg }]}>
    <Text style={[styles.text, { color: tones[tone].fg }]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: spacing.sm },
  text: { fontSize: font.size.xs, fontWeight: font.weight.semibold },
});

export default StatusBadge;
