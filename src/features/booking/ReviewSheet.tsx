import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../ui/Button";
import { rateListing, reviewListing } from "../../services";
import { getErrorMessage } from "../../services/http";
import { titleCase } from "../../lib/format";
import { toast } from "../../lib/toast";
import type { ListingSummary } from "../../types/listing";
import { colors, font, radius, spacing } from "../../theme";

const labels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

interface ReviewSheetProps {
  listing: ListingSummary;
  onClose: () => void;
  onSaved: () => void;
}

/** Bottom sheet: star rating plus optional written review for a completed stay. */
const ReviewSheet = ({ listing, onClose, onSaved }: ReviewSheetProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      setError("Choose a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const text = comment.trim();
      if (text) await reviewListing(listing.id, text, rating);
      else await rateListing(listing.id, rating);
      toast.success("Thanks for your review!");
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't save your review. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable style={styles.dismiss} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">
              Rate your stay
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>
          <Text style={styles.muted}>{titleCase(listing.property_name)}</Text>

          <View style={styles.stars} accessibilityRole="radiogroup" accessibilityLabel="Rating">
            {labels.map((label, i) => {
              const value = i + 1;
              return (
                <Pressable
                  key={value}
                  onPress={() => setRating(value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: rating === value }}
                  accessibilityLabel={`${value} star${value === 1 ? "" : "s"} (${label})`}
                  hitSlop={4}
                >
                  <Ionicons
                    name={value <= rating ? "star" : "star-outline"}
                    size={34}
                    color={value <= rating ? colors.warning : colors.subtle}
                  />
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.label}>{rating ? labels[rating - 1] : "Tap a star"}</Text>

          <Text style={styles.fieldLabel}>Tell other guests about it (optional)</Text>
          <TextInput
            style={styles.input}
            multiline
            maxLength={2000}
            value={comment}
            onChangeText={setComment}
            placeholder="What did you like? Anything to improve?"
            placeholderTextColor={colors.subtle}
            textAlignVertical="top"
            accessibilityLabel="Review"
          />

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button variant="secondary" onPress={onClose} style={styles.action}>
              Cancel
            </Button>
            <Button loading={submitting} onPress={() => void submit()} style={styles.action}>
              Submit review
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(16, 24, 40, 0.45)" },
  dismiss: { flex: 1 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.ink },
  muted: { fontSize: font.size.sm, color: colors.muted },
  stars: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  label: { textAlign: "center", fontSize: font.size.sm, color: colors.muted },
  fieldLabel: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.ink },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.size.md,
    color: colors.ink,
  },
  error: { fontSize: font.size.sm, color: colors.danger },
  actions: { flexDirection: "row", gap: spacing.md },
  action: { flex: 1 },
});

export default ReviewSheet;
