import { Tabs } from "expo-router/js-tabs";
import type { ColorValue } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../theme";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.subtle,
        headerTitleStyle: { color: colors.ink },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", headerShown: false, tabBarIcon: tabIcon("home-outline") }} />
      <Tabs.Screen name="vacants" options={{ title: "Explore", tabBarIcon: tabIcon("search-outline") }} />
      <Tabs.Screen name="favorites" options={{ title: "Saved", tabBarIcon: tabIcon("heart-outline") }} />
      <Tabs.Screen name="bookings" options={{ title: "Trips", tabBarIcon: tabIcon("calendar-outline") }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: tabIcon("person-outline") }} />
    </Tabs>
  );
}
