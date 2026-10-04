import { router } from "expo-router";
import Button from "../ui/Button";
import { EmptyState } from "../ui/States";
import { Screen } from "../ui/Screen";

export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        icon="compass-outline"
        title="Page not found"
        description="This screen doesn't exist."
        action={
          <Button onPress={() => router.replace("/")} style={{ alignSelf: "center" }}>
            Go home
          </Button>
        }
      />
    </Screen>
  );
}
