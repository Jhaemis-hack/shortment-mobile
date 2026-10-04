import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { signupSchema, validateForm, type FieldErrors } from "../schema";
import { resendVerification, signUp } from "../services";
import { getErrorMessage } from "../services/http";
import { safeNext } from "../lib/redirect";
import { toast } from "../lib/toast";
import { AuthAlert, AuthCard, AuthDivider, Legal, TextLink } from "../features/auth/AuthCard";
import GoogleButton from "../features/auth/GoogleButton";
import { colors, radius, spacing } from "../theme";

interface SignUpValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}

const emptyValues: SignUpValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
};

export default function SignupScreen() {
  const params = useLocalSearchParams<{ next?: string }>();
  const next = safeNext(params.next);
  const [values, setValues] = useState<SignUpValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<SignUpValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sentTo, setSentTo] = useState("");

  const update = (field: keyof SignUpValues) => (text: string) => setValues(prev => ({ ...prev, [field]: text }));
  const goToLogin = () => router.replace({ pathname: "/login", params: { next } });

  const submit = async () => {
    if (submitting) return;
    const found = await validateForm(signupSchema, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError("");
    try {
      const email = values.email.trim();
      await signUp({
        email,
        phone_number: values.phone_number.trim(),
        password: values.password,
        first_name: values.first_name.trim() || undefined,
        last_name: values.last_name.trim() || undefined,
      });
      setSentTo(email);
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    try {
      await resendVerification(sentTo);
      toast.success("We've sent a new verification link.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (sentTo) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`We've sent a verification link to ${sentTo}. Open it to activate your account, then log in.`}
        footer={
          <>
            Didn&apos;t get it? Check your spam folder or <TextLink onPress={() => void resend()}>resend the link</TextLink>.
          </>
        }
      >
        <View style={styles.mailIcon}>
          <Ionicons name="mail-outline" size={28} color={colors.brand} />
        </View>
        <Button size="lg" fullWidth onPress={goToLogin}>
          Go to log in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up for free to reserve your apartment."
      footer={
        <>
          Already have an account? <TextLink onPress={goToLogin}>Log in</TextLink>
        </>
      }
    >
      {formError ? <AuthAlert tone="error">{formError}</AuthAlert> : null}
      <View style={styles.row}>
        <View style={styles.cell}>
          <TextField
            label="First name"
            autoComplete="given-name"
            textContentType="givenName"
            autoCapitalize="words"
            value={values.first_name}
            onChangeText={update("first_name")}
            error={errors.first_name}
          />
        </View>
        <View style={styles.cell}>
          <TextField
            label="Last name"
            autoComplete="family-name"
            textContentType="familyName"
            autoCapitalize="words"
            value={values.last_name}
            onChangeText={update("last_name")}
            error={errors.last_name}
          />
        </View>
      </View>
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
      />
      <TextField
        label="Phone number"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        placeholder="08012345678"
        value={values.phone_number}
        onChangeText={update("phone_number")}
        error={errors.phone_number}
      />
      <TextField
        label="Password"
        password
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder="Create a password"
        hint="At least 8 characters, with a number and one of ! @ # $ % ^ & *"
        value={values.password}
        onChangeText={update("password")}
        error={errors.password}
      />
      <TextField
        label="Confirm password"
        password
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder="Re-enter your password"
        value={values.confirmPassword}
        onChangeText={update("confirmPassword")}
        error={errors.confirmPassword}
        onSubmitEditing={() => void submit()}
      />
      <Button size="lg" fullWidth loading={submitting} onPress={() => void submit()}>
        Create account
      </Button>
      <Legal>By creating an account, you agree to our Terms of Use and Privacy Policy.</Legal>
      <AuthDivider />
      <GoogleButton label="Sign up with Google" next={next} />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  cell: { flex: 1 },
  mailIcon: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
