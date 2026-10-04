import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import RequireAuth from "../../../components/RequireAuth";
import Button from "../../../ui/Button";
import { Card, Screen } from "../../../ui/Screen";
import { ErrorState, Spinner } from "../../../ui/States";
import { useAsync } from "../../../hooks/useAsync";
import { getListing } from "../../../services";
import { getErrorMessage } from "../../../services/http";
import { formatNaira, nightsBetween, pluralize, titleCase, todayIso } from "../../../lib/format";
import type { ListingDetail } from "../../../types/listing";
import DateField from "../../../features/booking/DateField";
import GuestStepper from "../../../features/booking/GuestStepper";
import { addDays, isIsoDate } from "../../../features/booking/dates";
import { useCheckout } from "../../../features/booking/useCheckout";
import { colors, font, radius, spacing } from "../../../theme";

type BookParams = {
  id: string;
  check_in?: string;
  check_out?: string;
  guests?: string;
};

const BookForm = ({ listing, params }: { listing: ListingDetail; params: BookParams }) => {
  const today = todayIso();
  const minNights = Math.max(1, listing.minimum_nights);
  const [checkIn, setCheckIn] = useState(isIsoDate(params.check_in) && params.check_in >= today ? params.check_in : "");
  const [checkOut, setCheckOut] = useState(
    isIsoDate(params.check_out) && checkIn && params.check_out > checkIn ? params.check_out : "",
  );
  const [guests, setGuests] = useState(() =>
    Math.min(Math.max(1, Number(params.guests) || 1), Math.max(1, listing.max_guests)),
  );
  const [agreed, setAgreed] = useState(false);
  const checkout = useCheckout();

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = listing.price_per_night * nights;
  const total = subtotal + listing.security_fee;

  const problem = !checkIn
    ? "Choose your check-in date."
    : !checkOut
      ? "Choose your check-out date."
      : nights < minNights
        ? `This apartment needs a minimum stay of ${pluralize(minNights, "night")}.`
        : "";

  const chooseCheckIn = (value: string) => {
    setCheckIn(value);
    checkout.clearError();
    // Keep the stay valid: push check-out out to the minimum stay.
    if (!checkOut || nightsBetween(value, checkOut) < minNights) setCheckOut(addDays(value, minNights));
  };

  const chooseCheckOut = (value: string) => {
    setCheckOut(value);
    checkout.clearError();
  };

  const pickNewDates = () => {
    setCheckIn("");
    setCheckOut("");
    checkout.clearError();
  };

  return (
    <Screen>
      <Card style={styles.listing}>
        <Image source={listing.cover_image} style={styles.cover} contentFit="cover" accessibilityIgnoresInvertColors />
        <View style={styles.listingText}>
          <Text style={styles.name} numberOfLines={2}>
            {titleCase(listing.property_name)}
          </Text>
          <Text style={styles.muted}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />{" "}
            {titleCase(`${listing.city}, ${listing.state}`)}
          </Text>
          <Text style={styles.muted}>
            <Text style={styles.price}>{formatNaira(listing.price_per_night)}</Text> / night
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Your stay</Text>
        <View style={styles.dates}>
          <DateField label="Check-in" value={checkIn} minimum={today} onChange={chooseCheckIn} />
          <DateField
            label="Check-out"
            value={checkOut}
            minimum={addDays(checkIn || today, checkIn ? minNights : 1)}
            onChange={chooseCheckOut}
          />
        </View>
        {minNights > 1 ? <Text style={styles.muted}>Minimum stay: {pluralize(minNights, "night")}</Text> : null}
        <GuestStepper value={guests} max={Math.max(1, listing.max_guests)} onChange={setGuests} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Price details</Text>
        {nights > 0 ? (
          <View style={styles.breakdown}>
            <Row label={`${formatNaira(listing.price_per_night)} × ${pluralize(nights, "night")}`} value={formatNaira(subtotal)} />
            <Row label="Refundable caution fee" value={formatNaira(listing.security_fee)} />
            <View style={styles.rule} />
            <Row label="Total (NGN)" value={formatNaira(total)} strong />
          </View>
        ) : (
          <Text style={styles.muted}>Choose your dates to see the total.</Text>
        )}

        {checkout.error ? (
          <View style={styles.error} accessibilityRole="alert">
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <View style={styles.errorBody}>
              <Text style={styles.errorText}>{checkout.error.message}</Text>
              {checkout.error.datesTaken ? (
                <Text style={styles.link} onPress={pickNewDates} accessibilityRole="link">
                  Pick new dates
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={() => setAgreed(prev => !prev)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          style={styles.terms}
        >
          <Ionicons name={agreed ? "checkbox" : "square-outline"} size={22} color={agreed ? colors.brand : colors.muted} />
          <Text style={styles.termsText}>I agree to the Terms of Use, Privacy Policy and the apartment&apos;s house rules.</Text>
        </Pressable>

        {problem ? <Text style={styles.muted}>{problem}</Text> : null}
        <Button
          size="lg"
          fullWidth
          disabled={!agreed || Boolean(problem)}
          loading={checkout.submitting}
          icon={<Ionicons name="lock-closed" size={16} color={colors.surface} />}
          onPress={() => void checkout.pay(listing.id, { check_in: checkIn, check_out: checkOut, guests })}
        >
          {nights > 0 ? `Pay ${formatNaira(total)} with Paystack` : "Pay with Paystack"}
        </Button>
        <Text style={styles.secure}>
          You&apos;ll pay securely on Paystack, then come back here. Dates are held for 30 minutes while you pay.
        </Text>
      </Card>
    </Screen>
  );
};

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, strong && styles.strong]}>{label}</Text>
    <Text style={[styles.rowValue, strong && styles.strong]}>{value}</Text>
  </View>
);

const BookContent = () => {
  const params = useLocalSearchParams<BookParams>();
  const id = params.id ?? "";
  const result = useAsync(() => getListing(id), [id]);

  if (result.status === "loading") return <Spinner label="Loading your stay…" />;
  if (result.status === "error") {
    return (
      <Screen>
        <ErrorState message={getErrorMessage(result.error)} onRetry={result.reload} />
      </Screen>
    );
  }
  return <BookForm listing={result.data} params={params} />;
};

export default function BookScreen() {
  return (
    <RequireAuth title="Log in to book">
      <BookContent />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  listing: { flexDirection: "row", alignItems: "center" },
  cover: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: colors.line },
  listingText: { flex: 1, gap: spacing.xs },
  name: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  price: { color: colors.ink, fontWeight: font.weight.semibold },
  muted: { fontSize: font.size.sm, color: colors.muted },
  cardTitle: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  dates: { flexDirection: "row", gap: spacing.md },
  breakdown: { gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  rowLabel: { flex: 1, fontSize: font.size.md, color: colors.muted },
  rowValue: { fontSize: font.size.md, color: colors.ink },
  strong: { color: colors.ink, fontWeight: font.weight.bold },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  error: { flexDirection: "row", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.dangerSoft },
  errorBody: { flex: 1, gap: spacing.xs },
  errorText: { fontSize: font.size.sm, color: colors.danger },
  link: { fontSize: font.size.sm, color: colors.brand, fontWeight: font.weight.semibold },
  terms: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  termsText: { flex: 1, fontSize: font.size.sm, color: colors.ink, lineHeight: 20 },
  secure: { fontSize: font.size.xs, color: colors.muted, textAlign: "center" },
});
