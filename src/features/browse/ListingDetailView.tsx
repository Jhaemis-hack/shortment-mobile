import type { ComponentProps, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ListingDetail } from "../../types/listing";
import { useIsSignedIn } from "../../store/auth-store";
import { loginHref } from "../../lib/redirect";
import {
  formatDate,
  formatMonthYear,
  formatNaira,
  formatTime,
  pluralize,
  sentenceCase,
  titleCase,
} from "../../lib/format";
import Button from "../../ui/Button";
import { colors, font, radius, shadow, spacing } from "../../theme";
import Gallery from "./Gallery";
import ListingMap from "./ListingMap";

type IconName = ComponentProps<typeof Ionicons>["name"];

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.heading} accessibilityRole="header">
      {title}
    </Text>
    {children}
  </View>
);

const Fact = ({ icon, children }: { icon: IconName; children: string }) => (
  <View style={styles.fact}>
    <Ionicons name={icon} size={18} color={colors.brand} />
    <Text style={styles.factText}>{children}</Text>
  </View>
);

const Avatar = ({ name, image, size }: { name: string; image: string | null; size: number }) => {
  const box = { width: size, height: size, borderRadius: size / 2 };
  return image ? (
    <Image source={{ uri: image }} contentFit="cover" style={box} />
  ) : (
    <View style={[styles.avatar, box]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
};

/** Everything on the apartment screen below the header, plus the sticky "Book" bar. */
const ListingDetailView = ({ listing }: { listing: ListingDetail }) => {
  const insets = useSafeAreaInsets();
  const signedIn = useIsSignedIn();
  const name = titleCase(listing.property_name);
  const images = listing.images.length > 0 ? listing.images : [listing.cover_image];

  const book = () => {
    const bookPath = `/apartments/${listing.id}/book` as const;
    if (signedIn) router.push(bookPath);
    else router.push(loginHref(bookPath));
  };

  return (
    <View style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Gallery images={images} title={name} />

        <View style={styles.body}>
          <View style={styles.intro}>
            <Text style={styles.type}>{titleCase(listing.apartment_type)}</Text>
            <Text style={styles.title} accessibilityRole="header">
              {name}
            </Text>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <Text style={styles.muted}>{titleCase(`${listing.address}, ${listing.city}, ${listing.state}`)}</Text>
            </View>
            {listing.average_rating !== null && (
              <View style={styles.row}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.strong}>{listing.average_rating.toFixed(1)}</Text>
                <Text style={styles.muted}>({pluralize(listing.review_count, "review")})</Text>
              </View>
            )}
            <Text style={styles.price}>
              <Text style={styles.priceStrong}>{formatNaira(listing.price_per_night)}</Text> / night
            </Text>
          </View>

          <View style={styles.facts}>
            <Fact icon="people-outline">{pluralize(listing.max_guests, "guest")}</Fact>
            <Fact icon="bed-outline">{pluralize(listing.bedrooms, "bedroom")}</Fact>
            <Fact icon="water-outline">{pluralize(listing.bathrooms, "bathroom")}</Fact>
            <Fact icon="moon-outline">{`Min. ${pluralize(listing.minimum_nights, "night")}`}</Fact>
          </View>

          <Text style={styles.paragraph}>{sentenceCase(listing.property_description)}</Text>

          {listing.amenities.length > 0 && (
            <Section title="What this place offers">
              <View style={styles.amenities}>
                {listing.amenities.map(amenity => (
                  <View key={amenity} style={styles.amenity}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                    <Text style={styles.amenityText}>{titleCase(amenity)}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          <Section title="Check-in and check-out">
            <View style={styles.times}>
              <View style={styles.time}>
                <Text style={styles.muted}>Check-in</Text>
                <Text style={styles.strong}>From {formatTime(listing.check_in_time)}</Text>
              </View>
              <View style={styles.time}>
                <Text style={styles.muted}>Check-out</Text>
                <Text style={styles.strong}>By {formatTime(listing.check_out_time)}</Text>
              </View>
            </View>
            <View style={styles.note}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.brand} />
              <Text style={styles.noteText}>
                A refundable caution fee of <Text style={styles.strong}>{formatNaira(listing.security_fee)}</Text>{" "}
                covers any damage or extra cleaning. The apartment is inspected at check-out and the balance is
                refunded within 3 days.
              </Text>
            </View>
          </Section>

          <Section title="Location">
            <Text style={styles.muted}>
              {titleCase(`${listing.city}, ${listing.state}`)}
              {listing.nearest_landmark ? ` · Near ${listing.nearest_landmark}` : ""}
            </Text>
            <ListingMap latitude={listing.latitude} longitude={listing.longitude} name={name} />
          </Section>

          <View style={[styles.section, styles.host]}>
            <Avatar name={listing.host.first_name} image={listing.host.profile_image} size={48} />
            <View style={styles.fill}>
              <Text style={styles.hostName}>Hosted by {titleCase(listing.host.first_name)}</Text>
              <Text style={styles.muted}>Host since {formatMonthYear(listing.host.member_since)}</Text>
            </View>
          </View>

          <Section title={listing.review_count > 0 ? `Reviews (${listing.review_count})` : "Reviews"}>
            {listing.reviews.length === 0 ? (
              <Text style={styles.muted}>No reviews yet. Be the first to stay here.</Text>
            ) : (
              listing.reviews.map(review => (
                <View key={review.id} style={styles.review}>
                  <View style={styles.reviewHead}>
                    <Avatar name={review.guest.first_name} image={review.guest.profile_image} size={36} />
                    <View style={styles.fill}>
                      <Text style={styles.strong}>{titleCase(review.guest.first_name)}</Text>
                      <Text style={styles.small}>{formatDate(review.created_at)}</Text>
                    </View>
                    <View style={styles.row} accessibilityLabel={`Rated ${review.rating} out of 5`}>
                      <Ionicons name="star" size={14} color={colors.warning} />
                      <Text style={styles.strong}>{review.rating}</Text>
                    </View>
                  </View>
                  {review.comment ? <Text style={styles.paragraph}>{sentenceCase(review.comment)}</Text> : null}
                </View>
              ))
            )}
          </Section>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.fill}>
          <Text style={styles.price}>
            <Text style={styles.priceStrong}>{formatNaira(listing.price_per_night)}</Text> / night
          </Text>
          <Text style={styles.small}>Min. {pluralize(listing.minimum_nights, "night")}</Text>
        </View>
        <Button size="lg" onPress={book}>
          Book
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  body: { padding: spacing.lg, gap: spacing.xl },
  intro: { gap: spacing.xs },
  type: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.brand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.ink },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs, flexWrap: "wrap" },
  muted: { fontSize: font.size.sm, color: colors.muted, flexShrink: 1 },
  small: { fontSize: font.size.xs, color: colors.muted },
  strong: { fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.ink },
  price: { fontSize: font.size.sm, color: colors.muted },
  priceStrong: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.ink },
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  fact: { flexDirection: "row", alignItems: "center", gap: spacing.xs, width: "46%" },
  factText: { fontSize: font.size.sm, color: colors.ink },
  paragraph: { fontSize: font.size.md, lineHeight: 22, color: colors.ink },
  section: { gap: spacing.md },
  heading: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  amenities: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.sm },
  amenity: { flexDirection: "row", alignItems: "center", gap: spacing.xs, width: "50%", paddingRight: spacing.sm },
  amenityText: { fontSize: font.size.sm, color: colors.ink, flexShrink: 1 },
  times: { flexDirection: "row", gap: spacing.md },
  time: {
    flex: 1,
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  note: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
  },
  noteText: { flex: 1, fontSize: font.size.sm, lineHeight: 20, color: colors.ink },
  host: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  hostName: { fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.ink },
  avatar: { backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.brand, fontWeight: font.weight.bold },
  review: { gap: spacing.sm, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadow.raised,
  },
});

export default ListingDetailView;
