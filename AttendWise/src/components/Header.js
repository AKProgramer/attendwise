import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

/**
 * Top bar of the application.
 *
 * PROPS:
 *   title    - main heading text
 *   subtitle - optional smaller line underneath
 *   onBack   - optional function; when given, a Back button is shown
 *
 * The Back button and the subtitle are CONDITIONALLY RENDERED, so the same
 * component works for the Dashboard (no back button) and for Course Details
 * (back button needed).
 */
export default function Header({ title, subtitle, onBack }) {
  return (
    <View style={styles.container}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.back} hitSlop={10}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      )}

      <Text style={styles.title}>{title}</Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  back: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textMuted,
  },
});
