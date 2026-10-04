import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ListingSummary } from "../../types/listing";
import { formatNaira, pluralize, titleCase } from "../../lib/format";
import { listingPath } from "../../lib/redirect";
import { Skeleton } from "../../ui/States";
import { colors, font, radius, shadow, spacing } from "../../theme";
import SaveButton from "./SaveButton";

interface ListingCardProps {
  listing: ListingSummary;
  /** Extra controls under the card, e.g. "Book now" on the Saved screen. */
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Apartment tile: cover, name, location, facts and nightly price. Tapping opens the apartment. */
const ListingCard = ({ listing, footer, style }: ListingCardProps) => {
  const name = titleCase(listing.property_name);
  return (
    <View style={[styles.card, style]}>
      <Pressable
        onPress={() => router.push(listingPath(listing.id))}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${formatNaira(listing.price_per_night)} per night`}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.media}>
          <Image source={{ uri: listing.cover_image }} contentFit="cover" transition={200} style={styles.image} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{titleCase(listing.apartment_type)}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {name}
            </Text>
            {listing.average_rating !== null && (
              <View style={styles.rating} accessibilityLabel={`Rated ${listing.average_rating} out of 5`}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.ratingText}>
                  {listing.average_rating.toFixed(1)}
                  <Text style={styles.muted}> ({listing.review_count})</Text>
                </Text>
              </View>
            )}
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={styles.muted} numberOfLines={1}>
              {titleCase(listing.city)}, {titleCase(listing.state)}
            </Text>
          </View>
          <Text style={styles.muted}>
            {pluralize(listing.bedrooms, "bed")} · {pluralize(listing.bathrooms, "bath")} ·{" "}
            {pluralize(listing.max_guests, "guest")}
          </Text>
          <Text style={styles.price}>
            <Text style={styles.priceStrong}>{formatNaira(listing.price_per_night)}</Text> / night
          </Text>
        </View>
      </Pressable>
      <View style={styles.save}>
        <SaveButton listingId={listing.id} />
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
};

/** Placeholder card shown while listings load. */
export const ListingCardSkeleton = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.card, style]} accessibilityLabel="Loading apartment">
    <View style={[styles.media, styles.skeletonMedia]} />
    <View style={styles.body}>
      <Skeleton width="70%" height={18} />
      <Skeleton width="45%" />
      <Skeleton width="35%" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.card },
  pressed: { opacity: 0.85 },
  media: {
    aspectRatio: 16 / 10,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.line,
  },
  skeletonMedia: { backgroundColor: colors.line },
  image: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  badgeText: { fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.brand },
  save: { position: "absolute", top: spacing.md, right: spacing.md },
  body: { padding: spacing.md, gap: spacing.xs },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { flex: 1, fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.ink },
  rating: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.ink },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  muted: { fontSize: font.size.sm, color: colors.muted, fontWeight: font.weight.regular },
  price: { fontSize: font.size.sm, color: colors.muted, marginTop: spacing.xs },
  priceStrong: { fontSize: font.size.md, fontWeight: font.weight.bold, color: colors.ink },
  footer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
});

export default ListingCard;
