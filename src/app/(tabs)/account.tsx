import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../ui/Button";
import { PageHeader, Screen } from "../../ui/Screen";
import { EmptyState } from "../../ui/States";
import { useAuthStore } from "../../store/auth-store";
import { getMe } from "../../services";
import { toast } from "../../lib/toast";
import IdentityCard from "../../features/account/IdentityCard";
import PasswordCard from "../../features/account/PasswordCard";
import ProfileCard from "../../features/account/ProfileCard";
import { FormScreen } from "../../features/auth/AuthCard";
import { colors, spacing } from "../../theme";

const SignedOut = () => (
  <Screen>
    <EmptyState
      icon="person-circle-outline"
      title="Your Shortment account"
      description="Log in to manage your bookings, saved apartments and details."
      action={
        <View style={styles.signedOutActions}>
          <Button fullWidth onPress={() => router.push({ pathname: "/login", params: { next: "/account" } })}>
            Log in
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onPress={() => router.push({ pathname: "/signup", params: { next: "/account" } })}
          >
            Create account
          </Button>
        </View>
      }
    />
  </Screen>
);

export default function AccountScreen() {
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const logOut = useAuthStore(state => state.logOut);
  const signedIn = Boolean(user);

  // Refresh the stored profile in case it changed elsewhere (e.g. on the website).
  useEffect(() => {
    if (signedIn) getMe().then(setUser, () => undefined);
  }, [signedIn, setUser]);

  if (!user) return <SignedOut />;

  const onLogOut = () => {
    logOut();
    toast.success("You've been logged out.");
  };

  return (
    <FormScreen>
      <PageHeader title="Account" subtitle="Update your personal details and password." />
      <IdentityCard user={user} />
      {/* Keyed so the form resets when the stored profile is replaced. */}
      <ProfileCard key={JSON.stringify(user)} user={user} />
      <PasswordCard user={user} />
      <Button
        variant="ghost"
        fullWidth
        onPress={onLogOut}
        icon={<Ionicons name="log-out-outline" size={18} color={colors.brand} />}
      >
        Log out
      </Button>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  signedOutActions: { alignSelf: "stretch", gap: spacing.sm },
});
