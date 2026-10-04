import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/auth-store";
import { useSavedStore } from "../store/saved-store";
import { colors } from "../theme";

export default function RootLayout() {
  const hydrated = useAuthStore(state => state.hydrated);
  const token = useAuthStore(state => state.token);
  const loadSaved = useSavedStore(state => state.load);
  const resetSaved = useSavedStore(state => state.reset);

  // Saved hearts follow the session: load on sign-in, clear on sign-out.
  useEffect(() => {
    if (!hydrated) return;
    if (token) void loadSaved();
    else resetSaved();
  }, [hydrated, token, loadSaved, resetSaved]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.brand,
          headerTitleStyle: { color: colors.ink },
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="apartments/[id]/index" options={{ title: "Apartment" }} />
        <Stack.Screen name="apartments/[id]/book" options={{ title: "Book your stay" }} />
        <Stack.Screen name="bookings/[id]" options={{ title: "Booking" }} />
        <Stack.Screen name="bookings/confirmation" options={{ title: "Payment", headerBackVisible: false }} />
        <Stack.Screen name="login" options={{ title: "Log in", presentation: "modal" }} />
        <Stack.Screen name="signup" options={{ title: "Create account", presentation: "modal" }} />
        <Stack.Screen name="forgot-password" options={{ title: "Forgot password" }} />
        <Stack.Screen name="reset-password" options={{ title: "Reset password" }} />
        <Stack.Screen name="verify-email" options={{ title: "Verify email" }} />
        <Stack.Screen name="auth/google/callback" options={{ title: "Signing in", headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
      </Stack>
      <Toast />
    </SafeAreaProvider>
  );
}
