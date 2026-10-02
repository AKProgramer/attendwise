import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

/**
 * Small reusable heading used above every block of content.
 * Keeping it as a component means all section headings look identical.
 *
 * PROPS: title (required), hint (optional grey text on the right)
 */
export default function SectionTitle({ title, hint }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
