import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import Button from "../../ui/Button";
import TextField from "../../ui/TextField";
import { Card } from "../../ui/Screen";
import { changePassword } from "../../services";
import { getErrorMessage } from "../../services/http";
import { changePasswordSchema, validateForm, type FieldErrors } from "../../schema";
import { toast } from "../../lib/toast";
import type { Profile } from "../../types/user";
import { TextLink } from "../auth/AuthCard";
import { colors, font } from "../../theme";

interface PasswordValues {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const emptyPasswords: PasswordValues = { old_password: "", new_password: "", confirm_password: "" };

const PasswordCard = ({ user }: { user: Profile }) => {
  const [values, setValues] = useState<PasswordValues>(emptyPasswords);
  const [errors, setErrors] = useState<FieldErrors<PasswordValues>>({});
  const [saving, setSaving] = useState(false);

  const update = (field: keyof PasswordValues) => (text: string) => setValues(prev => ({ ...prev, [field]: text }));

  if (!user.has_password) {
    return (
      <Card>
        <Text style={styles.title}>Password</Text>
        <Text style={styles.muted}>
          You sign in with Google, so there&apos;s no password on this account. To add one,{" "}
          <TextLink onPress={() => router.push("/forgot-password")}>request a password reset link</TextLink>.
        </Text>
      </Card>
    );
  }

  const submit = async () => {
    const found = await validateForm(changePasswordSchema, values);
    if (!values.old_password) found.old_password = "Enter your current password";
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await changePassword(values.old_password, values.new_password);
      setValues(emptyPasswords);
      toast.success("Your password has been updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't update your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Text style={styles.title}>Change password</Text>
      <TextField
        label="Current password"
        password
        value={values.old_password}
        onChangeText={update("old_password")}
        autoComplete="current-password"
        error={errors.old_password}
      />
      <TextField
        label="New password"
        password
        value={values.new_password}
        onChangeText={update("new_password")}
        autoComplete="new-password"
        hint="At least 8 characters, with a number and one of ! @ # $ % ^ & *"
        error={errors.new_password}
      />
      <TextField
        label="Confirm new password"
        password
        value={values.confirm_password}
        onChangeText={update("confirm_password")}
        autoComplete="new-password"
        error={errors.confirm_password}
      />
      <Button loading={saving} onPress={() => void submit()} style={styles.button}>
        Update password
      </Button>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  muted: { fontSize: font.size.sm, color: colors.muted, lineHeight: 20 },
  button: { alignSelf: "flex-end" },
});

export default PasswordCard;
