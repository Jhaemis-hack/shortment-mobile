import { useCallback, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "../../ui/Screen";
import Button from "../../ui/Button";
import { EmptyState, ErrorState, SlowHint } from "../../ui/States";
import { useAsync } from "../../hooks/useAsync";
import { useSavedStore } from "../../store/saved-store";
import { getSaved } from "../../services";
import { getErrorMessage } from "../../services/http";
import { toast } from "../../lib/toast";
import ListingCard, { ListingCardSkeleton } from "../browse/ListingCard";
import { colors, font, spacing } from "../../theme";

const subtitle = "Apartments you've saved. Book each one with its own dates.";

/**
 * The guest's Saved apartments. Each stay is booked and paid separately, so every
 * card gets its own "Book now".
 */
const SavedList = () => {
  const result = useAsync(() => getSaved(1, 50), []);
  // Hide cards as soon as the heart is toggled off, without refetching.
  const savedIds = useSavedStore(state => state.ids);
  const [refreshing, setRefreshing] = useState(false);
  const focusedOnce = useRef(false);

  const refresh = useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) setRefreshing(true);
      try {
        result.setData(await getSaved(1, 50));
      } catch (error) {
        if (showSpinner) toast.error(getErrorMessage(error));
      } finally {
        if (showSpinner) setRefreshing(false);
      }
    },
    // setData is recreated each render; the latest one is all we need.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Pick up apartments saved elsewhere since the last visit (the first focus is the initial load).
  useFocusEffect(
    useCallback(() => {
      if (!focusedOnce.current) {
        focusedOnce.current = true;
        return;
      }
      void refresh(false);
    }, [refresh]),
  );

  const header = <Text style={styles.subtitle}>{subtitle}</Text>;

  if (result.status !== "success") {
    return (
      <Screen>
        {header}
        {result.status === "loading" ? (
          <View style={styles.list}>
            <SlowHint />
            <ListingCardSkeleton />
          </View>
        ) : (
          <ErrorState message={getErrorMessage(result.error)} onRetry={result.reload} />
        )}
      </Screen>
    );
  }

  const items = result.data.items.filter(item => !savedIds || savedIds.has(item.id));
  return (
    <Screen scroll={false}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            footer={
              <Button fullWidth onPress={() => router.push(`/apartments/${item.id}/book`)}>
                Book now
              </Button>
            }
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Nothing saved yet"
            description="Tap the heart on any apartment to save it here."
            action={
              <Button onPress={() => router.navigate("/vacants")} style={styles.centered}>
                Browse apartments
              </Button>
            }
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh(true)} />}
        contentContainerStyle={styles.content}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  list: { gap: spacing.lg },
  subtitle: { fontSize: font.size.sm, color: colors.muted },
  centered: { alignSelf: "center" },
});

export default SavedList;
