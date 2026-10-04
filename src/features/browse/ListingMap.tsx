import { Linking, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../ui/Button";
import { toast } from "../../lib/toast";
import { colors, radius, spacing } from "../../theme";

interface ListingMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

const LEAFLET = "https://unpkg.com/leaflet@1.9.4/dist";

/** Self-contained Leaflet page: CARTO tiles of OSM data (OSM's own tile servers reject requests without a Referer, which an inline WebView page has none of), one marker, all interaction disabled. */
const mapHtml = (lat: number, lng: number) => `<!doctype html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${LEAFLET}/leaflet.css">
<style>html,body,#map{margin:0;height:100%;width:100%;}</style>
</head><body><div id="map"></div>
<script src="${LEAFLET}/leaflet.js"></script>
<script>
var pos = [${JSON.stringify(lat)}, ${JSON.stringify(lng)}];
var map = L.map("map", { zoomControl: false, dragging: false, touchZoom: false, doubleClickZoom: false,
  scrollWheelZoom: false, boxZoom: false, keyboard: false, tap: false }).setView(pos, 14);
L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png", {
  maxZoom: 19, subdomains: "abcd", attribution: "&copy; OpenStreetMap contributors &copy; CARTO" }).addTo(map);
L.marker(pos).addTo(map);
</script></body></html>`;

/** Small static map of the apartment, plus a button that opens the device's maps app. */
const ListingMap = ({ latitude, longitude, name }: ListingMapProps) => {
  const openInMaps = () => {
    const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(name)})`;
    Linking.openURL(url).catch(() => toast.error("No maps app is available on this device."));
  };

  return (
    <View style={styles.wrap}>
      {/* pointerEvents="none" keeps the map static and lets the page scroll over it. */}
      <View style={styles.map} pointerEvents="none">
        <WebView
          source={{ html: mapHtml(latitude, longitude) }}
          originWhitelist={["*"]}
          scrollEnabled={false}
          javaScriptEnabled
          style={styles.web}
        />
      </View>
      <Button
        variant="secondary"
        size="sm"
        onPress={openInMaps}
        icon={<Ionicons name="navigate-outline" size={16} color={colors.brand} />}
      >
        Open in Maps
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  map: { height: 200, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.line },
  web: { flex: 1, backgroundColor: colors.line },
});

export default ListingMap;
