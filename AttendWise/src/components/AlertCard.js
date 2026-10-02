import React from "react";
import { View, Text, StyleSheet } from "react-native";
import StatusBadge from "./StatusBadge";
import PrimaryButton from "./PrimaryButton";
import { colors, spacing, radius, getStatusColors } from "../theme";

/**
 * One academic alert.
 *
 * PROPS:
 *   alert         - the generated alert object
 *   onSendEmail   - function called when "Send Email Alert" is pressed
 *   emailEnabled  - when false the button is disabled and a reason is shown
 *
 * The left edge of the card is coloured by severity, so critical alerts are
 * recognisable before reading any text.
 */
export default function AlertCard({ alert, onSendEmail, emailEnabled }) {
  const statusColors = getStatusColors(alert.level);

  return (
    <View style={[styles.card, { borderLeftColor: statusColors.main }]}>
      <View style={styles.topRow}>
        <Text style={styles.course} numberOfLines={1}>
          {alert.courseName}
        </Text>
        <StatusBadge status={alert.level} small />
      </View>

      <Text style={[styles.attendance, { color: statusColors.main }]}>
        {alert.attendance}% attendance
      </Text>

      <Text style={styles.message}>{alert.message}</Text>

      <PrimaryButton
        label={emailEnabled ? "Send Email Alert" : "Email Alerts Disabled"}
        onPress={onSendEmail}
        variant="outline"
        disabled={!emailEnabled}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  course: {
    flex: 1,
    paddingRight: spacing.md,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  attendance: {
    marginTop: spacing.xs,
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  button: {
    marginTop: spacing.md,
  },
});
