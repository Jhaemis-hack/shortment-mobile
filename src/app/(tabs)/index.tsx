import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Screen } from "../../ui/Screen";
import Button from "../../ui/Button";
import { ErrorState } from "../../ui/States";
import { useAsync } from "../../hooks/useAsync";
import { getListings } from "../../services";
import { getErrorMessage } from "../../services/http";
import { searchLocations } from "../../lib/constant";
import ListingCard, { ListingCardSkeleton } from "../../features/browse/ListingCard";
import PickerField from "../../features/browse/PickerField";
import { colors, font, radius, shadow, spacing } from "../../theme";

const CARD_WIDTH = 280;

const highlights = [
  { value: "24/7", label: "Guest support" },
  { value: "100%", label: "Verified apartments" },
  { value: "8+", label: "Cities covered" },
];

const facilities = [
  { icon: "briefcase-outline", label: "Private workspace" },
  { icon: "car-outline", label: "Parking area" },
  { icon: "wifi-outline", label: "Free Wi-Fi" },
  { icon: "flash-outline", label: "24/7 electricity" },
  { icon: "water-outline", label: "Swimming pool" },
  { icon: "barbell-outline", label: "Fitness space" },
] as const;

const browseAll = () => router.navigate({ pathname: "/vacants", params: { ltn: "", a_type: "", b_num: "" } });

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [ltn, setLtn] = useState("");
  const featured = useAsync(() => getListings({ page: 1, page_size: 6 }), []);

  // Replaces any filters left on Explore with this search.
  const search = () => router.navigate({ pathname: "/vacants", params: { ltn, a_type: "", b_num: "" } });

  return (
    <Screen contentStyle={styles.page} refreshing={false} onRefresh={featured.reload}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.eyebrow}>Short-let apartments across Nigeria</Text>
        <Text style={styles.headline} accessibilityRole="header">
          Find your perfect shortlet in Nigeria
        </Text>
        <Text style={styles.lead}>
          Discover comfortable and affordable apartments in the heart of Nigeria&apos;s most vibrant cities.
        </Text>
        <View style={styles.searchCard}>
          <PickerField
            label="Location"
            placeholder="Anywhere"
            value={ltn}
            options={searchLocations}
            onChange={setLtn}
          />
          <Button
            size="lg"
            fullWidth
            onPress={search}
            icon={<Ionicons name="search-outline" size={18} color={colors.surface} />}
          >
            Search
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <View style={styles.fill}>
            <Text style={styles.heading} accessibilityRole="header">
              Featured apartments
            </Text>
            <Text style={styles.muted}>Experience comfort and luxury in every stay</Text>
          </View>
          <Button variant="ghost" size="sm" onPress={browseAll}>
            See all
          </Button>
        </View>
        {featured.status === "error" ? (
          <ErrorState message={getErrorMessage(featured.error)} onRetry={featured.reload} />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featured.status === "success" ? featured.data.items : []}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ListingCard listing={item} style={styles.card} />}
            ListEmptyComponent={
              featured.status === "loading" ? (
                <View style={styles.row}>
                  <ListingCardSkeleton style={styles.card} />
                  <ListingCardSkeleton style={styles.card} />
                </View>
              ) : (
                <Text style={styles.muted}>No apartments to show yet.</Text>
              )
            }
            contentContainerStyle={styles.carousel}
          />
        )}
      </View>

      <View style={[styles.section, styles.padded]}>
        <Text style={styles.heading} accessibilityRole="header">
          Why Shortment
        </Text>
        <Text style={styles.paragraph}>
          Shortment serviced apartments blend home-like comfort with modern amenities, for short and long stays alike.
          Every apartment is fully serviced, so you can settle in and feel at home from day one.
        </Text>
        <View style={styles.stats}>
          {highlights.map(item => (
            <View key={item.label} style={styles.stat}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.facilities}>
          {facilities.map(item => (
            <View key={item.label} style={styles.facility}>
              <Ionicons name={item.icon} size={18} color={colors.brand} />
              <Text style={styles.facilityText}>{item.label}</Text>
            </View>
          ))}
        </View>
        <Button variant="secondary" size="lg" fullWidth onPress={browseAll}>
          Browse apartments
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { padding: 0, gap: spacing.xl, paddingBottom: spacing.xl },
  fill: { flex: 1 },
  hero: {
    backgroundColor: colors.brandSoft,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  eyebrow: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.brand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headline: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.brandDark },
  lead: { fontSize: font.size.md, lineHeight: 22, color: colors.ink },
  searchCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.raised,
  },
  section: { gap: spacing.md },
  padded: { paddingHorizontal: spacing.lg },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg },
  heading: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.ink },
  muted: { fontSize: font.size.sm, color: colors.muted },
  paragraph: { fontSize: font.size.md, lineHeight: 22, color: colors.ink },
  carousel: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  card: { width: CARD_WIDTH },
  stats: { flexDirection: "row", gap: spacing.sm },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  statValue: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.brand },
  statLabel: { fontSize: font.size.xs, color: colors.muted, textAlign: "center" },
  facilities: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.sm },
  facility: { flexDirection: "row", alignItems: "center", gap: spacing.sm, width: "50%" },
  facilityText: { fontSize: font.size.sm, color: colors.ink },
});
