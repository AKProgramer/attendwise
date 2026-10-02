import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";

/**
 * A small selectable pill.
 *
 * PROPS: label, selected (boolean), onPress
 *
 * Used twice on the Courses screen - once for the status filters and once
 * for the sort options - which is exactly why it is its own component.
 */
export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.primary,
  },
});
