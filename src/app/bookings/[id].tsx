import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import RequireAuth from "../../components/RequireAuth";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import { Card, Screen } from "../../ui/Screen";
import { ErrorState, Spinner } from "../../ui/States";
import { useAsync } from "../../hooks/useAsync";
import { getBooking } from "../../services";
import { getErrorMessage, getStatus } from "../../services/http";
import { formatDate, formatNaira, pluralize, titleCase } from "../../lib/format";
import type { Booking } from "../../types/booking";
import ReviewSheet from "../../features/booking/ReviewSheet";
import { guestStatus, paymentStatus } from "../../features/booking/status";
import { useCheckout } from "../../features/booking/useCheckout";
import { colors, font, spacing } from "../../theme";

const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detail}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const BookingDetail = ({ booking, onChanged }: { booking: Booking; onChanged: () => void }) => {
  const [reviewing, setReviewing] = useState(false);
  const checkout = useCheckout();
  const { listing } = booking;
  const guest = guestStatus[booking.guest_status];
  const payment = paymentStatus[booking.payment_status];
  const canPay = booking.payment_status === "pending" && booking.guest_status !== "cancelled";

  return (
    <Screen>
      <Card style={styles.hero}>
        <Image source={listing.cover_image} style={styles.cover} contentFit="cover" />
        <View style={styles.heroBody}>
          <Text style={styles.name}>{titleCase(listing.property_name)}</Text>
          <Text style={styles.muted}>
            <Ionicons name="location-outline" size={14} color={colors.muted} /> {titleCase(`${listing.address}, ${listing.city}, ${listing.state}`)}
          </Text>
          <View style={styles.badges}>
            <StatusBadge tone={guest.tone}>{guest.label}</StatusBadge>
            <StatusBadge tone={payment.tone}>{payment.label}</StatusBadge>
          </View>
          <Button variant="ghost" size="sm" onPress={() => router.push({ pathname: "/apartments/[id]", params: { id: listing.id } })}>
            View apartment
          </Button>
        </View>
      </Card>

      <Card>
        <Detail label="Check-in" value={formatDate(booking.check_in)} />
        <Detail label="Check-out" value={formatDate(booking.check_out)} />
        <Detail label="Length of stay" value={pluralize(booking.nights, "night")} />
        <Detail label="Guests" value={pluralize(booking.guests, "guest")} />
        <View style={styles.rule} />
        <Detail label="Total" value={formatNaira(booking.amount)} />
        <Detail label="Booking" value={booking.booking_id} />
      </Card>

      {canPay ? (
        <Card>
          <Text style={styles.cardTitle}>Finish paying</Text>
          <Text style={styles.muted}>
            This booking is waiting for payment. Dates are held for 30 minutes after you start checkout.
          </Text>
          {checkout.error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {checkout.error.message}
            </Text>
          ) : null}
          <Button
            fullWidth
            loading={checkout.submitting}
            icon={<Ionicons name="lock-closed" size={16} color={colors.surface} />}
            onPress={() =>
              void checkout.pay(listing.id, {
                check_in: booking.check_in,
                check_out: booking.check_out,
                guests: booking.guests,
              })
            }
          >
            Pay now
          </Button>
        </Card>
      ) : null}

      {booking.can_review ? (
        <Card>
          <Text style={styles.cardTitle}>How was your stay?</Text>
          <Text style={styles.muted}>Your rating helps other guests choose.</Text>
          <Button variant="secondary" onPress={() => setReviewing(true)}>
            Rate your stay
          </Button>
        </Card>
      ) : null}

      {reviewing ? (
        <ReviewSheet
          listing={listing}
          onClose={() => setReviewing(false)}
          onSaved={() => {
            setReviewing(false);
            onChanged();
          }}
        />
      ) : null}
    </Screen>
  );
};

const BookingDetailContent = () => {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const result = useAsync(() => getBooking(id), [id]);

  if (result.status === "loading") return <Spinner label="Loading your booking…" />;
  if (result.status === "error") {
    const notFound = getStatus(result.error) === 404;
    return (
      <Screen>
        <ErrorState
          message={notFound ? "We couldn't find this booking." : getErrorMessage(result.error)}
          onRetry={notFound ? undefined : result.reload}
        />
      </Screen>
    );
  }
  return <BookingDetail booking={result.data} onChanged={result.reload} />;
};

export default function BookingDetailScreen() {
  return (
    <RequireAuth title="Log in to see this booking">
      <BookingDetailContent />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 0, overflow: "hidden", gap: 0 },
  cover: { width: "100%", height: 180, backgroundColor: colors.line },
  heroBody: { padding: spacing.lg, gap: spacing.sm },
  name: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.ink },
  muted: { fontSize: font.size.sm, color: colors.muted, lineHeight: 20 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  cardTitle: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  detail: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  detailLabel: { fontSize: font.size.md, color: colors.muted },
  detailValue: { flexShrink: 1, fontSize: font.size.md, color: colors.ink, fontWeight: font.weight.medium, textAlign: "right" },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  error: { fontSize: font.size.sm, color: colors.danger },
});
