import { useCallback } from "react";
import { router, useNavigation, type Href } from "expo-router";
import { useAuthStore } from "../../store/auth-store";
import { titleCase } from "../../lib/format";
import { safeNext } from "../../lib/redirect";
import { toast } from "../../lib/toast";
import type { Session } from "../../services";

/** Root-stack screens that belong to signing in; they are dismissed once the session exists. */
const AUTH_ROUTES = new Set(["login", "signup", "forgot-password", "reset-password", "verify-email", "auth/google/callback"]);

interface RouteLike {
  name: string;
  params?: object;
  state?: { index?: number; routes: RouteLike[] };
}

/** In-app path of a root-stack route, e.g. `apartments/[id]/book` + {id} → `/apartments/abc/book`. */
const pathOf = (route: RouteLike): string => {
  const params: Record<string, unknown> = { ...route.params };
  if (route.name === "(tabs)") {
    const tabs = route.state;
    const tab = tabs ? tabs.routes[tabs.index ?? 0]?.name : params.screen;
    return typeof tab === "string" && tab !== "index" ? `/${tab}` : "/";
  }
  const path = route.name
    .replace(/\[([^\]]+)\]/g, (_, key: string) => String(params[key] ?? ""))
    .replace(/(^|\/)index$/, "");
  return `/${path}`;
};

/**
 * Stores a fresh session and continues to `next`: auth screens on top of the stack are dismissed,
 * and if the screen underneath isn't `next` we navigate there. The root layout reloads saved ids.
 *
 * Returns false (and does nothing) when this exact session is already active — Google sign-in can
 * finish from both the login screen and the deep-linked callback route.
 */
export const useCompleteSignIn = () => {
  const navigation = useNavigation();
  const setSession = useAuthStore(state => state.setSession);

  return useCallback(
    (session: Session, nextParam: string | string[] | undefined): boolean => {
      if (useAuthStore.getState().token === session.token) return false;
      const next = safeNext(nextParam);

      setSession(session.user, session.token);
      const name = session.user.first_name ? `, ${titleCase(session.user.first_name)}` : "";
      toast.success(`Welcome back${name}!`);

      const routes = (navigation.getState()?.routes ?? []) as RouteLike[];
      let authOnTop = 0;
      while (authOnTop < routes.length && AUTH_ROUTES.has(routes[routes.length - 1 - authOnTop]?.name ?? "")) {
        authOnTop += 1;
      }
      const below = routes[routes.length - 1 - authOnTop];
      // `next` is validated by safeNext to be an in-app path; typed routes can't know that statically.
      const target = next as Href;
      if (!below) {
        router.replace(target);
        return true;
      }
      if (authOnTop > 0) router.dismiss(authOnTop);
      if (pathOf(below) !== next.split("?")[0]) router.navigate(target);
      return true;
    },
    [navigation, setSession],
  );
};
