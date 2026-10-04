import { router, Stack, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../ui/Screen";
import Button from "../../../ui/Button";
import { EmptyState, ErrorState, Spinner } from "../../../ui/States";
import { useAsync } from "../../../hooks/useAsync";
import { getListing } from "../../../services";
import { getErrorMessage, getStatus } from "../../../services/http";
import ListingDetailView from "../../../features/browse/ListingDetailView";
import SaveButton from "../../../features/browse/SaveButton";

export default function ApartmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = typeof id === "string" ? id : "";
  const result = useAsync(() => getListing(listingId), [listingId]);

  if (result.status === "success") {
    return (
      <>
        <Stack.Screen options={{ headerRight: () => <SaveButton listingId={listingId} variant="plain" /> }} />
        <Screen scroll={false}>
          <ListingDetailView listing={result.data} />
        </Screen>
      </>
    );
  }

  const status = result.status === "error" ? getStatus(result.error) : undefined;
  return (
    <Screen>
      {result.status === "loading" ? (
        <Spinner label="Loading apartment…" />
      ) : status === 404 || status === 400 ? (
        <EmptyState
          icon="home-outline"
          title="Apartment not found"
          description="This apartment doesn't exist or is no longer available."
          action={
            <Button onPress={() => router.navigate("/vacants")} style={{ alignSelf: "center" }}>
              Browse apartments
            </Button>
          }
        />
      ) : (
        <ErrorState message={getErrorMessage(result.error)} onRetry={result.reload} />
      )}
    </Screen>
  );
}
