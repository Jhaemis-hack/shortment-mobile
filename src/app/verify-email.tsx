import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import { Spinner } from "../ui/States";
import { resendVerification, verifyEmail } from "../services";
import { getErrorMessage } from "../services/http";
import { AuthAlert, AuthCard } from "../features/auth/AuthCard";

type State = { status: "verifying" } | { status: "verified" } | { status: "failed"; message: string };

/** Target of the verification email link: /verify-email?id=&token= */
export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ id?: string; token?: string }>();
  const id = params.id ?? "";
  const token = params.token ?? "";
  const linkValid = Boolean(id && token);
  const [state, setState] = useState<State>(
    linkValid ? { status: "verifying" } : { status: "failed", message: "This verification link is incomplete." },
  );
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);
  // The token is single-use; only send it once.
  const started = useRef(false);

  useEffect(() => {
    if (!linkValid || started.current) return;
    started.current = true;
    verifyEmail(id, token).then(
      () => setState({ status: "verified" }),
      (error: unknown) =>
        setState({ status: "failed", message: getErrorMessage(error, "This link is invalid or has expired.") }),
    );
  }, [id, token, linkValid]);

  const resend = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    try {
      await resendVerification(email.trim());
      setResent(true);
    } catch (error) {
      setState({ status: "failed", message: getErrorMessage(error) });
    } finally {
      setSending(false);
    }
  };

  if (state.status === "verifying") return <Spinner label="Verifying your email…" />;

  if (state.status === "verified") {
    return (
      <AuthCard title="Email verified" subtitle="Your account is ready. Log in to start booking.">
        <AuthAlert tone="success">Thanks for confirming your email address.</AuthAlert>
        <Button size="lg" fullWidth onPress={() => router.replace("/login")}>
          Log in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="We couldn't verify your email" subtitle="Verification links expire and can only be used once.">
      <AuthAlert tone="error">{state.message}</AuthAlert>
      {resent ? (
        <AuthAlert tone="success">If that account needs verifying, a new link is on its way.</AuthAlert>
      ) : (
        <>
          <TextField
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            hint="Enter your email and we'll send a fresh link."
            onSubmitEditing={() => void resend()}
          />
          <Button size="lg" fullWidth loading={sending} onPress={() => void resend()}>
            Send a new link
          </Button>
        </>
      )}
    </AuthCard>
  );
}
