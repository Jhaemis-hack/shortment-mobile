import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { resetPasswordSchema, validateForm, type FieldErrors } from "../schema";
import { resetPassword } from "../services";
import { getErrorMessage } from "../services/http";
import { AuthAlert, AuthCard, TextLink } from "../features/auth/AuthCard";

interface Values {
  password: string;
  confirmPassword: string;
}

/** Target of the reset email link: /reset-password?id=&token= */
export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ id?: string; token?: string }>();
  const id = params.id ?? "";
  const token = params.token ?? "";
  const [values, setValues] = useState<Values>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState(id && token ? "" : "This reset link is incomplete.");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting || !id || !token) return;
    const found = await validateForm(resetPasswordSchema, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    setFormError("");
    try {
      await resetPassword(id, token, values.password);
      setDone(true);
    } catch (error) {
      setFormError(getErrorMessage(error, "This link is invalid or has expired."));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="You can now log in with your new password.">
        <Button size="lg" fullWidth onPress={() => router.replace("/login")}>
          Log in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      footer={
        <>
          Link expired? <TextLink onPress={() => router.replace("/forgot-password")}>Request a new one</TextLink>
        </>
      }
    >
      {formError ? <AuthAlert tone="error">{formError}</AuthAlert> : null}
      <TextField
        label="New password"
        password
        autoComplete="new-password"
        hint="At least 8 characters, with a number and one of ! @ # $ % ^ & *"
        value={values.password}
        onChangeText={text => setValues(prev => ({ ...prev, password: text }))}
        error={errors.password}
      />
      <TextField
        label="Confirm new password"
        password
        autoComplete="new-password"
        value={values.confirmPassword}
        onChangeText={text => setValues(prev => ({ ...prev, confirmPassword: text }))}
        error={errors.confirmPassword}
        onSubmitEditing={() => void submit()}
      />
      <Button size="lg" fullWidth loading={submitting} disabled={!id || !token} onPress={() => void submit()}>
        Update password
      </Button>
    </AuthCard>
  );
}
