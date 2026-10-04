import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../ui/Screen";
import Button from "../../ui/Button";
import { EmptyState, ErrorState, SlowHint } from "../../ui/States";
import { apartmentTypes, bedroomOptions, searchLocations } from "../../lib/constant";
import { pluralize } from "../../lib/format";
import { getErrorMessage } from "../../services/http";
import ListingCard, { ListingCardSkeleton } from "../../features/browse/ListingCard";
import PickerField from "../../features/browse/PickerField";
import { emptySearch, searchFromParams, type SearchValues } from "../../features/browse/search";
import { useListingFeed } from "../../features/browse/useListingFeed";
import { colors, font, spacing } from "../../theme";

const PAGE_SIZE = 12;

export default function VacantsScreen() {
  // Filters live in the route params, so Home's search can deep-link here.
  const filters = searchFromParams(useLocalSearchParams<{ ltn?: string; a_type?: string; b_num?: string }>());
  const { result, loadingMore, refreshing, loadMore, refresh } = useListingFeed(filters, PAGE_SIZE);

  const apply = (next: SearchValues) => router.setParams({ ...next });
  const set = (field: keyof SearchValues) => (value: string) => apply({ ...filters, [field]: value });
  const hasFilters = Boolean(filters.ltn || filters.a_type || filters.b_num);
  const locationLabel = searchLocations.find(option => option.value === filters.ltn)?.label;

  const header = (
    <View style={styles.header}>
      <View>
        <Text style={styles.title} accessibilityRole="header">
          {locationLabel ? `Apartments in ${locationLabel}` : "All apartments"}
        </Text>
        <Text style={styles.subtitle}>Experience comfort and luxury in every stay.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <PickerField
          variant="chip"
          label="Location"
          placeholder="Anywhere"
          value={filters.ltn}
          options={searchLocations}
          onChange={set("ltn")}
        />
        <PickerField
          variant="chip"
          label="Apartment type"
          placeholder="Any type"
          value={filters.a_type}
          options={apartmentTypes}
          onChange={set("a_type")}
        />
        <PickerField
          variant="chip"
          label="Bedrooms"
          placeholder="Any"
          value={filters.b_num}
          options={bedroomOptions}
          onChange={set("b_num")}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onPress={() => apply(emptySearch)}>
            Clear
          </Button>
        )}
      </ScrollView>
      {result.status === "success" && result.data.items.length > 0 && (
        <Text style={styles.count}>{pluralize(result.data.totalResults, "apartment")} found</Text>
      )}
    </View>
  );

  if (result.status !== "success") {
    return (
      <Screen>
        {header}
        {result.status === "loading" ? (
          <View style={styles.list} accessibilityLabel="Loading apartments">
            <SlowHint />
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </View>
        ) : (
          <ErrorState message={getErrorMessage(result.error)} onRetry={result.reload} />
        )}
      </Screen>
    );
  }

  const { items, currentPage, totalPages } = result.data;
  return (
    <Screen scroll={false}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No apartments match your search"
            description="Try a different location or fewer filters."
            action={
              hasFilters ? (
                <Button variant="secondary" onPress={() => apply(emptySearch)} style={styles.centered}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.brand} style={styles.footer} />
          ) : currentPage < totalPages ? (
            <Button variant="secondary" onPress={() => void loadMore()} style={[styles.centered, styles.footer]}>
              Load more
            </Button>
          ) : null
        }
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
        contentContainerStyle={styles.content}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  list: { gap: spacing.lg },
  header: { gap: spacing.md },
  title: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.ink },
  subtitle: { fontSize: font.size.sm, color: colors.muted },
  filters: { gap: spacing.sm, alignItems: "center" },
  count: { fontSize: font.size.sm, color: colors.muted },
  centered: { alignSelf: "center" },
  footer: { marginVertical: spacing.md },
});
