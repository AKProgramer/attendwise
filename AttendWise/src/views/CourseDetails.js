import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import Header from "../components/Header";
import SectionTitle from "../components/SectionTitle";
import StatusBadge from "../components/StatusBadge";
import ProgressBar from "../components/ProgressBar";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, radius, getStatusColors } from "../theme";
import {
  MIN_ATTENDANCE,
  calculateAttendance,
  getAttendanceStatus,
  calculateClassesCanMiss,
  calculateClassesToRecover,
  getProjectedAttendance,
} from "../utils/attendance";

const MAX_FUTURE_CLASSES = 50;

/**
 * Everything about one course, plus the two interactive tools.
 *
 * PROPS: course, onBack, onMarkPresent, onMarkAbsent
 *
 * The attendance record itself lives in App.js. This screen only asks App.js
 * to change it (onMarkPresent / onMarkAbsent) and then re-renders with the
 * new numbers, which is why the dashboard and alerts stay in step.
 */
export default function CourseDetails({ course, onBack, onMarkPresent, onMarkAbsent }) {
  // Local state for the What If calculator. It is kept here and not in App.js
  // because no other screen needs to know about it.
  const [futureClasses, setFutureClasses] = useState("");
  const [simulation, setSimulation] = useState(null);

  const percentage = calculateAttendance(course);
  const status = getAttendanceStatus(percentage);
  const statusColors = getStatusColors(status);
  const missedClasses = course.totalClasses - course.attendedClasses;

  const canMiss = calculateClassesCanMiss(course);
  const needToAttend = calculateClassesToRecover(course);

  // ---- Input validation ---------------------------------------------------
  const typedValue = futureClasses.trim();
  const isEmpty = typedValue === "";
  const isWholeNumber = /^\d+$/.test(typedValue); // digits only, no "-" or "abc"
  const enteredNumber = Number(typedValue);

  function getValidationError() {
    if (isEmpty) return "";
    if (!isWholeNumber) return "Please enter a whole number of classes (digits only).";
    if (enteredNumber < 1) return "Enter at least 1 class.";
    if (enteredNumber > MAX_FUTURE_CLASSES)
      return `Please enter ${MAX_FUTURE_CLASSES} classes or fewer.`;
    return "";
  }

  const validationError = getValidationError();
  const isValidInput = !isEmpty && validationError === "";

  function runSimulation(willAttend) {
    // Store only the question that was asked, not the answer. The answer is
    // recalculated on every render, so it stays correct even after the
    // attendance is changed with the buttons below.
    setSimulation({ classes: enteredNumber, willAttend });
  }

  const projected = simulation
    ? getProjectedAttendance(course, simulation.classes, simulation.willAttend)
    : null;

  // ---- The advice line changes with the student's situation ---------------
  function getAdvice() {
    if (percentage < MIN_ATTENDANCE) {
      return `You need to attend the next ${needToAttend} classes to reach ${MIN_ATTENDANCE}%.`;
    }
    if (canMiss === 0) {
      return "You should not miss your next class.";
    }
    return `You can currently miss ${canMiss} ${
      canMiss === 1 ? "class" : "classes"
    } and remain above ${MIN_ATTENDANCE}%.`;
  }

  return (
    <View>
      <Header title={course.name} subtitle={course.code} onBack={onBack} />

      {/* ---------- Attendance summary ---------- */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.headRow}>
            <Text style={[styles.bigPercentage, { color: statusColors.main }]}>
              {percentage}%
            </Text>
            <StatusBadge status={status} />
          </View>

          <ProgressBar percentage={percentage} />

          <View style={styles.detailList}>
            <DetailRow label="Instructor" value={course.instructor} />
            <DetailRow label="Classes attended" value={course.attendedClasses} />
            <DetailRow label="Classes missed" value={missedClasses} />
            <DetailRow label="Total classes" value={course.totalClasses} />
            <DetailRow
              label="Required attendance"
              value={`${MIN_ATTENDANCE}%`}
            />
          </View>

          <View style={[styles.advice, { backgroundColor: statusColors.soft }]}>
            <Text style={[styles.adviceText, { color: statusColors.main }]}>
              {getAdvice()}
            </Text>
          </View>
        </View>
      </View>

      {/* ---------- Update attendance ---------- */}
      <View style={styles.section}>
        <SectionTitle title="Record Today's Class" hint="updates everything" />
        <View style={styles.buttonRow}>
          <PrimaryButton
            label="Mark Present"
            onPress={onMarkPresent}
            style={styles.flexButton}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label="Mark Absent"
            onPress={onMarkAbsent}
            variant="danger"
            style={styles.flexButton}
          />
        </View>
        <Text style={styles.helper}>
          Marking present adds one attended class and one total class. Marking
          absent adds only a total class.
        </Text>
      </View>

      {/* ---------- What If calculator ---------- */}
      <View style={styles.section}>
        <SectionTitle title="What If Calculator" hint="plan ahead" />

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Future classes</Text>

          <TextInput
            style={[styles.input, validationError !== "" && styles.inputError]}
            value={futureClasses}
            onChangeText={setFutureClasses}
            placeholder="e.g. 3"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={3}
          />

          {/* Validation feedback is only rendered when something is wrong. */}
          {validationError !== "" && (
            <Text style={styles.errorText}>{validationError}</Text>
          )}

          <View style={styles.buttonRow}>
            <PrimaryButton
              label="Attend All"
              onPress={() => runSimulation(true)}
              disabled={!isValidInput}
              style={styles.flexButton}
            />
            <View style={styles.gap} />
            <PrimaryButton
              label="Miss All"
              onPress={() => runSimulation(false)}
              variant="outline"
              disabled={!isValidInput}
              style={styles.flexButton}
            />
          </View>

          {/* The result block appears only after a simulation has been run. */}
          {simulation && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>
                Current attendance: {percentage}%
              </Text>
              <Text style={styles.resultLabel}>
                If you {simulation.willAttend ? "attend" : "miss"} the next{" "}
                {simulation.classes}{" "}
                {simulation.classes === 1 ? "class" : "classes"}:
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color: getStatusColors(getAttendanceStatus(projected)).main,
                  },
                ]}
              >
                Projected attendance: {projected}%
              </Text>
              <Text style={styles.resultNote}>
                {projected >= MIN_ATTENDANCE
                  ? `This keeps you above the ${MIN_ATTENDANCE}% requirement.`
                  : `This drops you below the ${MIN_ATTENDANCE}% requirement.`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * A single "label ..... value" line.
 * Small enough to live in this file, but still written once instead of five
 * times with the same styles copied.
 */
function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  bigPercentage: {
    fontSize: 36,
    fontWeight: "800",
  },
  detailList: {
    marginTop: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  advice: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  adviceText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  buttonRow: {
    flexDirection: "row",
  },
  flexButton: {
    flex: 1,
  },
  gap: {
    width: spacing.md,
  },
  helper: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputError: {
    borderColor: colors.critical,
  },
  errorText: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    fontSize: 12,
    color: colors.critical,
    fontWeight: "600",
  },
  resultBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  resultLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  resultValue: {
    marginTop: spacing.sm,
    fontSize: 20,
    fontWeight: "800",
  },
  resultNote: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
  },
});
