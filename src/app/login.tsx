import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { loginSchema, validateForm, type FieldErrors } from "../schema";
import { logIn, resendVerification } from "../services";
import { getErrorMessage, getStatus } from "../services/http";
import { safeNext } from "../lib/redirect";
import { toast } from "../lib/toast";
import { AuthAlert, AuthCard, AuthDivider, LinkRow, TextLink } from "../features/auth/AuthCard";
import GoogleButton from "../features/auth/GoogleButton";
import { GOOGLE_ERROR } from "../features/auth/google";
import { useCompleteSignIn } from "../features/auth/useCompleteSignIn";

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const params = useLocalSearchParams<{ next?: string; error?: string }>();
  const next = safeNext(params.next);
  const completeSignIn = useCompleteSignIn();

  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(params.error === "google" ? GOOGLE_ERROR : "");
  const [unverified, setUnverified] = useState(false);

  const update = (field: keyof LoginValues) => (text: string) => setValues(prev => ({ ...prev, [field]: text }));

  const submit = async () => {
    if (submitting) return;
    const found = await validateForm(loginSchema, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError("");
    setUnverified(false);
    try {
      completeSignIn(await logIn(values.email.trim(), values.password), next);
    } catch (error) {
      const status = getStatus(error);
      if (status === 403) setUnverified(true);
      else setFormError(status === 401 ? "Incorrect email or password." : getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    try {
      await resendVerification(values.email.trim());
      toast.success("If that account needs verifying, we've sent a new link to your email.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to manage your bookings and saved apartments."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <TextLink onPress={() => router.replace({ pathname: "/signup", params: { next } })}>Create one</TextLink>
        </>
      }
    >
      {formError ? <AuthAlert tone="error">{formError}</AuthAlert> : null}
      {unverified ? (
        <AuthAlert tone="info">
          Please verify your email before logging in. Check your inbox for the link, or{" "}
          <TextLink onPress={() => void resend()}>send a new one</TextLink>.
        </AuthAlert>
      ) : null}
      <TextField
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder="you@example.com"
        value={values.email}
        onChangeText={update("email")}
        error={errors.email}
        returnKeyType="next"
      />
      <TextField
        label="Password"
        password
        autoComplete="current-password"
        textContentType="password"
        placeholder="Enter your password"
        value={values.password}
        onChangeText={update("password")}
        error={errors.password}
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
      />
      <LinkRow onPress={() => router.push("/forgot-password")}>Forgot password?</LinkRow>
      <Button size="lg" fullWidth loading={submitting} onPress={() => void submit()}>
        Log in
      </Button>
      <AuthDivider />
      <GoogleButton label="Continue with Google" next={next} />
    </AuthCard>
  );
}
