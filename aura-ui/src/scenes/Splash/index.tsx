import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../../theme";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AURA</Text>
      <Text style={styles.subtitle}>Smart life coach for your goals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logo: {
    fontSize: 44,
    fontWeight: "900",
    color: palette.primary,
    letterSpacing: 1,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 16,
    fontWeight: "600",
  },
});

