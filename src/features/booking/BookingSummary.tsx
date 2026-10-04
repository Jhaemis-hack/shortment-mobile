import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { formatDate, formatNaira, pluralize, titleCase } from "../../lib/format";
import { Card } from "../../ui/Screen";
import type { Booking } from "../../types/booking";
import { colors, font, radius, spacing } from "../../theme";

/** Compact card: cover, name, dates, guests, amount and booking id. */
const BookingSummary = ({ booking }: { booking: Booking }) => (
  <Card style={styles.card}>
    <Image source={booking.listing.cover_image} style={styles.cover} contentFit="cover" />
    <View style={styles.text}>
      <Text style={styles.name} numberOfLines={2}>
        {titleCase(booking.listing.property_name)}
      </Text>
      <Text style={styles.muted}>
        {formatDate(booking.check_in)} – {formatDate(booking.check_out)} · {pluralize(booking.nights, "night")} ·{" "}
        {pluralize(booking.guests, "guest")}
      </Text>
      <Text style={styles.muted}>
        <Text style={styles.amount}>{formatNaira(booking.amount)}</Text> · Booking {booking.booking_id}
      </Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  cover: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.line },
  text: { flex: 1, gap: spacing.xs },
  name: { fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.ink },
  muted: { fontSize: font.size.sm, color: colors.muted },
  amount: { color: colors.ink, fontWeight: font.weight.semibold },
});

export default BookingSummary;
