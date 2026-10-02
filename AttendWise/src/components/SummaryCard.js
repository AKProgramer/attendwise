import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";

/**
 * One statistic on the dashboard (e.g. "Overall Attendance  80%").
 *
 * PROPS: label, value, caption (optional), accent (colour of the value)
 *
 * The dashboard renders four of these from an array, so the four cards are
 * one component used four times instead of four copies of the same JSX.
 */
export default function SummaryCard({ label, value, caption, accent = colors.primary }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  value: {
    marginTop: spacing.xs,
    fontSize: 26,
    fontWeight: "800",
  },
  caption: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
