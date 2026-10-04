import { useEffect, useRef } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Spinner } from "../../../ui/States";
import { getStatus } from "../../../services/http";
import { toast } from "../../../lib/toast";
import { exchangeGoogleCodeOnce, GOOGLE_ERROR, takeRememberedNext } from "../../../features/auth/google";
import { useCompleteSignIn } from "../../../features/auth/useCompleteSignIn";

/**
 * shortment://auth/google/callback?code=… (or ?error=google), opened by the API's redirect.
 * Usually the login screen's browser session also receives the code; both share one exchange,
 * and whichever finishes the sign-in first wins.
 */
export default function GoogleCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const navigation = useNavigation();
  const completeSignIn = useCompleteSignIn();
  // The code is single-use: start once, but ignore results after this screen unmounts.
  const started = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const routes = navigation.getState()?.routes ?? [];
    const previous = routes[routes.length - 2]?.name;
    const fail = (message: string) => {
      if (!mounted.current) return;
      toast.error(message);
      // Back to the login screen we came from, or a fresh one when the link opened the app.
      if (previous === "login" || previous === "signup") router.back();
      else router.replace({ pathname: "/login", params: { error: "google" } });
    };

    const code = params.code;
    if (!code || params.error) {
      fail(GOOGLE_ERROR);
      return;
    }
    const next = takeRememberedNext();
    exchangeGoogleCodeOnce(code).then(
      session => {
        // False when the login screen already finished this sign-in; just drop this route.
        if (mounted.current && !completeSignIn(session, next) && navigation.isFocused()) {
          if (router.canGoBack()) router.back();
          else router.replace("/");
        }
      },
      (error: unknown) =>
        fail(getStatus(error) === 403 ? "Please verify your email address before signing in." : GOOGLE_ERROR),
    );
  }, [completeSignIn, navigation, params.code, params.error]);

  return <Spinner label="Signing you in…" />;
}
