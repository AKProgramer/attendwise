import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, getStatusColors } from "../theme";
import { MIN_ATTENDANCE, getAttendanceStatus } from "../utils/attendance";

/**
 * Horizontal attendance bar.
 *
 * PROPS: percentage (0-100)
 *
 * It also draws a thin marker line at the minimum required attendance, so the
 * student can see at a glance whether they are above or below the rule.
 */
export default function ProgressBar({ percentage }) {
  const statusColors = getStatusColors(getAttendanceStatus(percentage));

  // Never let the bar overflow its track, even with odd data.
  const width = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${width}%`, backgroundColor: statusColors.main },
        ]}
      />
      <View style={[styles.marker, { left: `${MIN_ATTENDANCE}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: "hidden",
    justifyContent: "center",
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  marker: {
    position: "absolute",
    top: 0,
    width: 2,
    height: 8,
    backgroundColor: colors.text,
    opacity: 0.35,
  },
});
