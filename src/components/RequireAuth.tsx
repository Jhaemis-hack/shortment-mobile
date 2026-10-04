import type { ReactNode } from "react";
import { router, usePathname } from "expo-router";
import { useIsSignedIn } from "../store/auth-store";
import { loginHref } from "../lib/redirect";
import Button from "../ui/Button";
import { EmptyState } from "../ui/States";
import { Screen } from "../ui/Screen";

/**
 * Renders `children` only for a signed-in guest. Otherwise shows a prompt to log in,
 * returning here afterwards. (Tabs stay visible, so we prompt instead of redirecting.)
 */
const RequireAuth = ({ children, title = "Log in to continue" }: { children: ReactNode; title?: string }) => {
  const signedIn = useIsSignedIn();
  const pathname = usePathname();
  if (signedIn) return children;
  return (
    <Screen>
      <EmptyState
        icon="lock-closed-outline"
        title={title}
        description="You need an account to see this."
        action={
          <Button onPress={() => router.push(loginHref(pathname))} style={{ alignSelf: "center" }}>
            Log in
          </Button>
        }
      />
    </Screen>
  );
};

export default RequireAuth;
