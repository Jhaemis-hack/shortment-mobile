import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import StatusBadge from "../../ui/StatusBadge";
import { formatDate, formatNaira, pluralize, titleCase } from "../../lib/format";
import type { Booking } from "../../types/booking";
import { colors, font, radius, shadow, spacing } from "../../theme";
import { guestStatus, paymentStatus } from "./status";

/** One trip in the Trips list; tapping opens its details. */
const BookingCard = ({ booking, onPress }: { booking: Booking; onPress: () => void }) => {
  const { listing } = booking;
  const guest = guestStatus[booking.guest_status];
  const payment = paymentStatus[booking.payment_status];
  const name = titleCase(listing.property_name);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatDate(booking.check_in)} to ${formatDate(booking.check_out)}, ${guest.label}, ${payment.label}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={listing.cover_image} style={styles.cover} contentFit="cover" />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          <Ionicons name="location-outline" size={13} color={colors.muted} /> {titleCase(`${listing.city}, ${listing.state}`)}
        </Text>
        <View style={styles.badges}>
          <StatusBadge tone={guest.tone}>{guest.label}</StatusBadge>
          <StatusBadge tone={payment.tone}>{payment.label}</StatusBadge>
        </View>
        <Text style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color={colors.muted} /> {formatDate(booking.check_in)} –{" "}
          {formatDate(booking.check_out)} · {pluralize(booking.nights, "night")}
        </Text>
        <View style={styles.bottom}>
          <Text style={styles.meta}>
            <Ionicons name="people-outline" size={13} color={colors.muted} /> {pluralize(booking.guests, "guest")}
          </Text>
          <Text style={styles.amount}>{formatNaira(booking.amount)}</Text>
        </View>
        {booking.can_review ? <Text style={styles.review}>Rate your stay</Text> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  pressed: { opacity: 0.85 },
  cover: { width: 96, height: 112, borderRadius: radius.md, backgroundColor: colors.line },
  body: { flex: 1, gap: spacing.xs },
  name: { fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.ink },
  meta: { fontSize: font.size.sm, color: colors.muted },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.ink },
  review: { fontSize: font.size.sm, color: colors.brand, fontWeight: font.weight.semibold },
});

export default BookingCard;
