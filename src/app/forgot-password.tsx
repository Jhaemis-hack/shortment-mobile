import { useState } from "react";
import { router } from "expo-router";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { forgotPasswordSchema, validateForm } from "../schema";
import { requestPasswordReset } from "../services";
import { getErrorMessage } from "../services/http";
import { AuthAlert, AuthCard, TextLink } from "../features/auth/AuthCard";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    const found = await validateForm(forgotPasswordSchema, { email });
    setError(found.email ?? "");
    if (found.email) return;
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Usually opened from Log in; go back to it rather than stacking another copy.
  const backToLogin = () => (router.canGoBack() ? router.back() : router.replace("/login"));

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email you signed up with and we'll send you a reset link."
      footer={
        <>
          Remembered it? <TextLink onPress={backToLogin}>Back to log in</TextLink>
        </>
      }
    >
      {sent ? (
        <AuthAlert tone="success">
          If an account exists for {email.trim()}, you&apos;ll get an email with a reset link shortly. The link expires
          in 1 hour.
        </AuthAlert>
      ) : (
        <>
          <TextField
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={error}
            onSubmitEditing={() => void submit()}
          />
          <Button size="lg" fullWidth loading={submitting} onPress={() => void submit()}>
            Send reset link
          </Button>
        </>
      )}
    </AuthCard>
  );
}
