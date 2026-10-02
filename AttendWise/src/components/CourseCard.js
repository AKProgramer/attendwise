import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import { colors, spacing, radius, getStatusColors } from "../theme";
import { calculateAttendance, getAttendanceStatus } from "../utils/attendance";

/**
 * One course in the list.
 *
 * PROPS: course (object), onPress (function)
 *
 * The card receives only the raw course object and works out the percentage
 * and status itself, so the parent list stays very simple.
 */
export default function CourseCard({ course, onPress }) {
  const percentage = calculateAttendance(course);
  const status = getAttendanceStatus(percentage);
  const statusColors = getStatusColors(status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.code}>{course.code}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {course.name}
          </Text>
        </View>
        <StatusBadge status={status} small />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.classes}>
          {course.attendedClasses} / {course.totalClasses} classes attended
        </Text>
        <Text style={[styles.percentage, { color: statusColors.main }]}>
          {percentage}%
        </Text>
      </View>

      <ProgressBar percentage={percentage} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  code: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  name: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  classes: {
    fontSize: 13,
    color: colors.textMuted,
  },
  percentage: {
    fontSize: 18,
    fontWeight: "800",
  },
});
