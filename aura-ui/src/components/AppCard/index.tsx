import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { cardShadow, palette } from "../../theme";

export function AppCard({ children, style, variant = "default" }: { children: ReactNode; style?: object; variant?: "default" | "muted" }) {
  return <View style={[styles.card, variant === "muted" && styles.cardMuted, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    ...cardShadow.shadow,
  },
  cardMuted: {
    backgroundColor: palette.surfaceMuted,
    borderColor: "transparent",
  },
});
