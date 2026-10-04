import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../ui/Button";
import { Screen } from "../../ui/Screen";
import { Spinner } from "../../ui/States";
import { useAsync } from "../../hooks/useAsync";
import { useIsSignedIn } from "../../store/auth-store";
import { getBooking } from "../../services";
import { getErrorMessage } from "../../services/http";
import { toast } from "../../lib/toast";
import type { Booking } from "../../types/booking";
import BookingSummary from "../../features/booking/BookingSummary";
import { colors, font, radius, spacing } from "../../theme";

type Outcome = "confirmed" | "pending" | "failed" | "conflict" | "error";

const outcomes: Record<
  Outcome,
  { icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string; title: string; body: string }
> = {
  confirmed: {
    icon: "checkmark-circle-outline",
    fg: colors.success,
    bg: colors.successSoft,
    title: "Your booking is confirmed",
    body: "We've emailed your confirmation. We look forward to hosting you!",
  },
  pending: {
    icon: "time-outline",
    fg: colors.warning,
    bg: colors.warningSoft,
    title: "Your payment is processing",
    body: "Paystack is still confirming your payment. Check Trips in a few minutes; we'll email you once it's confirmed.",
  },
  failed: {
    icon: "close-circle-outline",
    fg: colors.danger,
    bg: colors.dangerSoft,
    title: "Payment didn't go through",
    body: "You haven't been charged for this booking. You can try again from the apartment page.",
  },
  conflict: {
    icon: "alert-circle-outline",
    fg: colors.danger,
    bg: colors.dangerSoft,
    title: "Those dates were taken",
    body: "Your payment went through, but the dates were booked by someone else first. Our team will arrange a full refund and contact you by email.",
  },
  error: {
    icon: "alert-circle-outline",
    fg: colors.danger,
    bg: colors.dangerSoft,
    title: "We couldn't confirm your payment",
    body: "Something went wrong while checking your payment. If you were charged, contact us and quote your payment reference.",
  },
};

/** The booking record is the source of truth; the `status` param (from the API redirect) is only a hint. */
const outcomeFor = (hint: string | undefined, booking: Booking | undefined): Outcome => {
  if (hint === "conflict") return "conflict";
  if (booking) {
    if (booking.payment_status === "confirmed") return "confirmed";
    if (booking.payment_status === "declined") return "failed";
    return "pending";
  }
  if (hint === "confirmed" || hint === "pending" || hint === "failed") return hint;
  return "error";
};

const POLL_MS = 3000;
const MAX_POLLS = 10; // ~30s for the Paystack webhook to confirm

/** Leaves the payment flow for a tab, dropping the booking screens underneath. */
const leaveTo = (path: "/bookings" | "/") => {
  if (router.canDismiss()) {
    router.dismissAll();
    router.navigate(path);
  } else {
    router.replace(path);
  }
};

export default function BookingConfirmationScreen() {
  const params = useLocalSearchParams<{ booking_id?: string; status?: string; reference?: string }>();
  const signedIn = useIsSignedIn();
  const bookingId = params.booking_id ?? "";

  const result = useAsync(
    async () => (bookingId && signedIn ? getBooking(bookingId) : undefined),
    [bookingId, signedIn],
  );
  const [latest, setLatest] = useState<Booking>();
  const [polls, setPolls] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const booking = latest ?? (result.status === "success" ? result.data : undefined);
  const pending = booking?.payment_status === "pending";

  // While pending, re-read the booking every few seconds; the webhook may confirm it.
  useEffect(() => {
    if (!booking || booking.payment_status !== "pending" || polls >= MAX_POLLS) return;
    const timer = setTimeout(() => {
      getBooking(booking.booking_id).then(
        fresh => {
          setLatest(fresh);
          setPolls(n => n + 1);
        },
        () => setPolls(n => n + 1),
      );
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [booking, polls]);

  // Hardware back leaves the payment flow instead of returning to the checkout screen.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        leaveTo("/");
        return true;
      });
      return () => subscription.remove();
    }, []),
  );

  const refresh = async () => {
    if (!booking) return;
    setRefreshing(true);
    try {
      setLatest(await getBooking(booking.booking_id));
      setPolls(0);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRefreshing(false);
    }
  };

  if (result.status === "loading") return <Spinner label="Checking your booking…" />;

  const outcome = outcomes[outcomeFor(params.status, booking)];
  const stillChecking = pending && polls < MAX_POLLS;

  return (
    <Screen contentStyle={styles.page}>
      <View style={[styles.icon, { backgroundColor: outcome.bg }]}>
        <Ionicons name={outcome.icon} size={36} color={outcome.fg} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {outcome.title}
      </Text>
      <Text style={styles.body}>{outcome.body}</Text>

      {stillChecking ? (
        <View style={styles.checking} accessibilityLiveRegion="polite">
          <ActivityIndicator size="small" color={colors.warning} />
          <Text style={styles.muted}>Checking with Paystack…</Text>
        </View>
      ) : null}

      {booking ? <BookingSummary booking={booking} /> : null}
      {!booking && params.reference ? <Text style={styles.muted}>Payment reference: {params.reference}</Text> : null}

      <View style={styles.actions}>
        {pending ? (
          <Button variant="secondary" fullWidth loading={refreshing} onPress={() => void refresh()}>
            Refresh
          </Button>
        ) : null}
        <Button fullWidth onPress={() => leaveTo("/bookings")}>
          View my trips
        </Button>
        <Button variant="ghost" fullWidth onPress={() => leaveTo("/")}>
          Back to home
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: "center", justifyContent: "center" },
  icon: { width: 72, height: 72, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  title: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.ink, textAlign: "center" },
  body: { fontSize: font.size.md, color: colors.muted, textAlign: "center", lineHeight: 22 },
  checking: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  muted: { fontSize: font.size.sm, color: colors.muted, textAlign: "center" },
  actions: { alignSelf: "stretch", gap: spacing.sm },
});
