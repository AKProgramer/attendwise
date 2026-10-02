import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";

/**
 * One button component used everywhere, so every button in the app has the
 * same height, radius and pressed-feedback.
 *
 * PROPS:
 *   label    - text on the button
 *   onPress  - function to run when tapped
 *   variant  - "primary" (filled) | "outline" | "danger"
 *   disabled - greys the button out and blocks onPress
 */
export default function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.critical,
    borderColor: colors.critical,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryLabel: { color: "#FFFFFF" },
  outlineLabel: { color: colors.text },
  dangerLabel: { color: "#FFFFFF" },
});
