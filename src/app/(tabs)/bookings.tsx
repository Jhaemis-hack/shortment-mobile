import { useCallback } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import RequireAuth from "../../components/RequireAuth";
import Button from "../../ui/Button";
import { PageHeader, Screen } from "../../ui/Screen";
import { EmptyState, ErrorState, Spinner } from "../../ui/States";
import { getErrorMessage } from "../../services/http";
import BookingCard from "../../features/booking/BookingCard";
import { useBookingPages } from "../../features/booking/useBookingPages";
import { colors, spacing } from "../../theme";

const Trips = () => {
  const trips = useBookingPages();
  const { loadFirst, loadOnFocus } = trips;

  // Load on first focus, then refresh quietly whenever the tab comes back into view.
  useFocusEffect(
    useCallback(() => {
      void loadOnFocus();
    }, [loadOnFocus]),
  );

  if (trips.status === "loading") return <Spinner label="Loading your trips…" />;
  if (trips.status === "error") {
    return (
      <Screen>
        <ErrorState message={getErrorMessage(trips.error)} onRetry={() => void loadFirst("initial")} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <FlatList
        data={trips.items}
        keyExtractor={booking => booking.booking_id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => router.push({ pathname: "/bookings/[id]", params: { id: item.booking_id } })}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<PageHeader title="My trips" subtitle="Your upcoming and past stays." />}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No bookings yet"
            description="When you book an apartment it will show up here."
            action={
              <Button onPress={() => router.navigate("/vacants")} style={styles.centered}>
                Find an apartment
              </Button>
            }
          />
        }
        ListFooterComponent={
          trips.loadingMore ? <ActivityIndicator style={styles.footer} color={colors.brand} /> : <View style={styles.footer} />
        }
        onEndReached={() => void trips.loadMore()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={trips.refreshing} onRefresh={() => void loadFirst("refresh")} colors={[colors.brand]} />
        }
      />
    </Screen>
  );
};

export default function TripsScreen() {
  return (
    <RequireAuth title="Log in to see your trips">
      <Trips />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  centered: { alignSelf: "center" },
  footer: { paddingVertical: spacing.md },
});
