import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "../../theme";

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  leftAction,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderRow}>
        <View style={styles.screenHeaderTitleRow}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
          ) : leftAction ? (
            leftAction
          ) : (
            <View style={styles.auraIconContainer}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.titleBlock}>
            <Text style={[styles.screenTitle, compact && styles.screenTitleCompact]} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.screenSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    marginBottom: 10,
  },
  screenHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  screenHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: palette.text,
    letterSpacing: -0.6,
  },
  screenTitleCompact: {
    fontSize: 24,
  },
  screenSubtitle: {
    marginTop: 5,
    fontSize: 14,
    color: palette.muted,
    lineHeight: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  auraIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
