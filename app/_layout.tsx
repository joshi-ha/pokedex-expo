// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "white",
          },
          headerShadowVisible: true,
          headerTitleStyle: {
            fontWeight: "600",
          },
          contentStyle: {
            backgroundColor: "#F5F5F5",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="details"
          options={{
            title: "Details",
            headerBackButtonDisplayMode: "minimal",
            presentation: "formSheet",
            sheetAllowedDetents: [0.4, 0.6, 0.9],
            sheetGrabberVisible: true,
            sheetCornerRadius: 20,
            sheetInitialDetentIndex: 0,
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
