import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../../ui/Button";
import TextField from "../../ui/TextField";
import { Card } from "../../ui/Screen";
import { useAuthStore } from "../../store/auth-store";
import { updateProfile } from "../../services";
import { getErrorMessage } from "../../services/http";
import { profileSchema, validateForm, type FieldErrors } from "../../schema";
import { toast } from "../../lib/toast";
import type { Profile } from "../../types/user";
import { colors, font, radius, spacing } from "../../theme";

interface ProfileValues {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  gender: "" | "male" | "female";
}

const toValues = (user: Profile): ProfileValues => ({
  first_name: user.first_name ?? "",
  last_name: user.last_name ?? "",
  // The API stores a 10-digit number without the leading 0; show it the way people type it.
  phone_number: user.phone_number ? `0${user.phone_number}` : "",
  address: user.address ?? "",
  gender: user.gender ?? "",
});

const genders: { value: ProfileValues["gender"]; label: string }[] = [
  { value: "", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

/** Personal details, read-only until "Edit details". Key it by the profile so it resets on change. */
const ProfileCard = ({ user }: { user: Profile }) => {
  const setUser = useAuthStore(state => state.setUser);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<ProfileValues>(() => toValues(user));
  const [errors, setErrors] = useState<FieldErrors<ProfileValues>>({});
  const [saving, setSaving] = useState(false);

  const update = (field: Exclude<keyof ProfileValues, "gender">) => (text: string) =>
    setValues(prev => ({ ...prev, [field]: text }));

  const cancel = () => {
    setValues(toValues(user));
    setErrors({});
    setEditing(false);
  };

  const save = async () => {
    const found = await validateForm(profileSchema, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone_number: values.phone_number.trim(),
        address: values.address.trim(),
        gender: values.gender || undefined,
      });
      setEditing(false);
      setUser(updated);
      toast.success("Your details have been saved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't save your details."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Text style={styles.title}>Personal details</Text>
      <TextField
        label="First name"
        value={values.first_name}
        onChangeText={update("first_name")}
        editable={editing}
        autoComplete="given-name"
        autoCapitalize="words"
        error={errors.first_name}
      />
      <TextField
        label="Last name"
        value={values.last_name}
        onChangeText={update("last_name")}
        editable={editing}
        autoComplete="family-name"
        autoCapitalize="words"
        error={errors.last_name}
      />
      <TextField label="Email" value={user.email} editable={false} hint="Contact support to change your email." />
      <TextField
        label="Phone number"
        value={values.phone_number}
        onChangeText={update("phone_number")}
        editable={editing}
        keyboardType="phone-pad"
        autoComplete="tel"
        error={errors.phone_number}
      />
      <TextField
        label="Address"
        value={values.address}
        onChangeText={update("address")}
        editable={editing}
        autoComplete="street-address"
        error={errors.address}
      />
      <View style={styles.genderField}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {genders.map(option => {
            const selected = values.gender === option.value;
            return (
              <Pressable
                key={option.label}
                disabled={!editing}
                onPress={() => setValues(prev => ({ ...prev, gender: option.value }))}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: !editing }}
                style={[styles.chip, selected && styles.chipSelected, !editing && !selected && styles.chipIdle]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.actions}>
        {editing ? (
          <>
            <Button variant="secondary" onPress={cancel} disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} onPress={() => void save()}>
              Save changes
            </Button>
          </>
        ) : (
          <Button variant="secondary" onPress={() => setEditing(true)}>
            Edit details
          </Button>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  genderField: { gap: spacing.xs },
  label: { fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  chipIdle: { opacity: 0.6 },
  chipText: { fontSize: font.size.sm, color: colors.ink },
  chipTextSelected: { color: colors.brand, fontWeight: font.weight.semibold },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm },
});

export default ProfileCard;
