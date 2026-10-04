import { useState } from "react";
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { colors, font, radius, spacing } from "../../theme";

/** Full-width, swipeable photo gallery with a "2 / 5" counter. */
const Gallery = ({ images, title }: { images: string[]; title: string }) => {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const height = Math.round(width * 0.68);

  return (
    <View style={{ height }}>
      <FlatList
        data={images}
        keyExtractor={(uri, i) => `${i}-${uri}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index: i }) => (
          <Image
            source={{ uri: item }}
            contentFit="cover"
            transition={200}
            style={{ width, height, backgroundColor: colors.line }}
            accessibilityLabel={`${title}, photo ${i + 1} of ${images.length}`}
          />
        )}
      />
      {images.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {index + 1} / {images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  counter: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: "rgba(16, 24, 40, 0.6)",
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  counterText: { color: colors.surface, fontSize: font.size.xs, fontWeight: font.weight.semibold },
});

export default Gallery;
