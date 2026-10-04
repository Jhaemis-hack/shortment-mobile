import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Card } from "../../ui/Screen";
import StatusBadge from "../../ui/StatusBadge";
import { useAuthStore } from "../../store/auth-store";
import { uploadProfileImage } from "../../services";
import { getErrorMessage } from "../../services/http";
import { titleCase } from "../../lib/format";
import { toast } from "../../lib/toast";
import type { Profile } from "../../types/user";
import { colors, font, radius, spacing } from "../../theme";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const AVATAR = 72;

/** Avatar (tap to change photo), name, email and verification badge. */
const IdentityCard = ({ user }: { user: Profile }) => {
  const setUser = useAuthStore(state => state.setUser);
  const [uploading, setUploading] = useState(false);

  const fullName = titleCase([user.first_name, user.last_name].filter(Boolean).join(" ")) || "Your account";
  const initial = (user.first_name || user.email).charAt(0).toUpperCase();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;
    if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_BYTES) {
      toast.error("Please choose an image under 5 MB.");
      return;
    }
    const type = asset.mimeType ?? "image/jpeg";
    if (!type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const name = asset.fileName ?? `profile.${type.split("/")[1] ?? "jpg"}`;
      setUser(await uploadProfileImage({ uri: asset.uri, name, type }));
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't upload that photo."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={() => void pickImage()}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        style={styles.avatar}
      >
        {user.profile_image ? (
          <Image source={user.profile_image} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <Text style={styles.initial}>{initial}</Text>
        )}
        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.surface} />
          </View>
        ) : null}
        <View style={styles.edit}>
          <Ionicons name="camera" size={14} color={colors.surface} />
        </View>
      </Pressable>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {fullName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
        {user.is_verified ? (
          <StatusBadge tone="success">Verified</StatusBadge>
        ) : (
          <StatusBadge tone="warning">Email not verified</StatusBadge>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: AVATAR, height: AVATAR, borderRadius: radius.pill },
  initial: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.brand },
  overlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.pill,
    backgroundColor: "rgba(16, 24, 40, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  edit: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: spacing.xs },
  name: { fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.ink },
  email: { fontSize: font.size.sm, color: colors.muted },
});

export default IdentityCard;
