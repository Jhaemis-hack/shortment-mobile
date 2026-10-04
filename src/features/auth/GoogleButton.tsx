import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../ui/Button";
import { toast } from "../../lib/toast";
import { getStatus } from "../../services/http";
import { colors } from "../../theme";
import { exchangeGoogleCodeOnce, GOOGLE_ERROR, startGoogleSignIn } from "./google";
import { useCompleteSignIn } from "./useCompleteSignIn";

/** "Continue with Google": browser sign-in, then the same session handling as password login. */
const GoogleButton = ({ label, next }: { label: string; next: string }) => {
  const completeSignIn = useCompleteSignIn();
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    try {
      const result = await startGoogleSignIn(next);
      if (result.type === "error") toast.error(GOOGLE_ERROR);
      if (result.type === "code") completeSignIn(await exchangeGoogleCodeOnce(result.code), next);
    } catch (error) {
      toast.error(getStatus(error) === 403 ? "Please verify your email address before signing in." : GOOGLE_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      loading={busy}
      onPress={() => void signIn()}
      icon={<Ionicons name="logo-google" size={18} color={colors.brand} />}
    >
      {label}
    </Button>
  );
};

export default GoogleButton;
