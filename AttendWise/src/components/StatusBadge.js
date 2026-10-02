import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radius, getStatusColors } from "../theme";

/**
 * Coloured pill showing SAFE / WARNING / CRITICAL.
 *
 * PROPS: status ("Safe" | "Warning" | "Critical"), small (optional boolean)
 *
 * The colour is not passed in - the component works it out from the status,
 * so a status can never be shown in the wrong colour anywhere in the app.
 */
export default function StatusBadge({ status, small }) {
  const statusColors = getStatusColors(status);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: statusColors.soft },
        small && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: statusColors.main },
          small && styles.textSmall,
        ]}
      >
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});
