import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { Profile } from "../types/user";

/** Encrypted on-device storage for the session (token + profile). */
const secureStorage: StateStorage = {
  getItem: name => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: name => SecureStore.deleteItemAsync(name),
};

interface AuthState {
  token: string;
  user: Profile | null;
  /** True after the user chose to log out (vs. a session that expired). Not persisted. */
  loggedOut: boolean;
  /** True once the persisted session has been read from SecureStore. Not persisted. */
  hydrated: boolean;
  setSession: (user: Profile, token: string) => void;
  setUser: (user: Profile) => void;
  clearData: () => void;
  logOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: "",
      user: null,
      loggedOut: false,
      hydrated: false,
      setSession: (user, token) => set({ user, token, loggedOut: false }),
      setUser: user => set({ user }),
      clearData: () => set({ token: "", user: null }),
      logOut: () => set({ token: "", user: null, loggedOut: true }),
    }),
    {
      // SecureStore keys allow only alphanumerics, ".", "-" and "_".
      name: "auth-storage",
      version: 1,
      storage: createJSONStorage(() => secureStorage),
      partialize: state => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => () => useAuthStore.setState({ hydrated: true }),
    },
  ),
);

export const useIsSignedIn = () => useAuthStore(state => state.token !== "");
