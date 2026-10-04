import { Pressable, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsSignedIn } from "../../store/auth-store";
import { useSavedStore } from "../../store/saved-store";
import { loginHref } from "../../lib/redirect";
import { colors, radius, shadow } from "../../theme";

interface SaveButtonProps {
  listingId: string;
  /** "floating" sits over a card image; "plain" is a bare icon, e.g. in a screen header. */
  variant?: "floating" | "plain";
}

/** Heart toggle that adds or removes a listing from the guest's Saved list. */
const SaveButton = ({ listingId, variant = "floating" }: SaveButtonProps) => {
  const signedIn = useIsSignedIn();
  const saved = useSavedStore(state => state.ids?.has(listingId) ?? false);
  const toggle = useSavedStore(state => state.toggle);
  const pathname = usePathname();

  const onPress = () => {
    if (!signedIn) {
      router.push(loginHref(pathname));
      return;
    }
    void toggle(listingId);
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={saved ? "Remove from Saved" : "Save"}
      accessibilityState={{ selected: saved }}
      style={({ pressed }) => [variant === "floating" && styles.floating, pressed && styles.pressed]}
    >
      <Ionicons
        name={saved ? "heart" : "heart-outline"}
        size={variant === "floating" ? 20 : 24}
        color={saved ? colors.danger : variant === "floating" ? colors.ink : colors.brand}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  floating: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  pressed: { opacity: 0.6 },
});

export default SaveButton;
