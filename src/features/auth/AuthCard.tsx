import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Card, Screen } from "../../ui/Screen";
import { colors, font, radius, spacing } from "../../theme";

/** Scrolling screen that keeps focused inputs above the keyboard. */
export const FormScreen = ({ children }: { children: ReactNode }) => (
  <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <Screen>{children}</Screen>
  </KeyboardAvoidingView>
);

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

/** Title, optional subtitle, a card with the form, and a footer line (e.g. "Already have an account?"). */
export const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => (
  <FormScreen>
    <View style={styles.head}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {children ? <Card>{children}</Card> : null}
    {footer ? <Text style={styles.footer}>{footer}</Text> : null}
  </FormScreen>
);

const alertTones = {
  error: { icon: "alert-circle-outline", bg: colors.dangerSoft, fg: colors.danger },
  success: { icon: "checkmark-circle-outline", bg: colors.successSoft, fg: colors.success },
  info: { icon: "information-circle-outline", bg: colors.brandSoft, fg: colors.brand },
} as const;

export const AuthAlert = ({ tone, children }: { tone: keyof typeof alertTones; children: ReactNode }) => {
  const style = alertTones[tone];
  return (
    <View
      style={[styles.alert, { backgroundColor: style.bg }]}
      accessibilityRole={tone === "error" ? "alert" : "text"}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={style.icon} size={20} color={style.fg} />
      <Text style={[styles.alertText, { color: style.fg }]}>{children}</Text>
    </View>
  );
};

export const AuthDivider = () => (
  <View style={styles.divider}>
    <View style={styles.rule} />
    <Text style={styles.dividerText}>or</Text>
    <View style={styles.rule} />
  </View>
);

/** Inline text link; nest inside a <Text>. */
export const TextLink = ({ onPress, children }: { onPress: () => void; children: string }) => (
  <Text style={styles.link} onPress={onPress} accessibilityRole="link" suppressHighlighting={false}>
    {children}
  </Text>
);

/** Right-aligned link row, e.g. "Forgot password?". */
export const LinkRow = ({ onPress, children }: { onPress: () => void; children: string }) => (
  <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8} style={styles.linkRow}>
    <Text style={styles.link}>{children}</Text>
  </Pressable>
);

export const Legal = ({ children }: { children: string }) => <Text style={styles.legal}>{children}</Text>;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: spacing.xs },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.ink },
  subtitle: { fontSize: font.size.md, color: colors.muted, lineHeight: 22 },
  footer: { fontSize: font.size.sm, color: colors.muted, textAlign: "center", lineHeight: 20 },
  alert: { flexDirection: "row", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, alignItems: "flex-start" },
  alertText: { flex: 1, fontSize: font.size.sm, lineHeight: 20 },
  divider: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  dividerText: { fontSize: font.size.sm, color: colors.subtle },
  link: { color: colors.brand, fontWeight: font.weight.semibold },
  linkRow: { alignSelf: "flex-end" },
  legal: { fontSize: font.size.xs, color: colors.muted, textAlign: "center" },
});
