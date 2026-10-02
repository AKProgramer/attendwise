import React, { useState } from "react";
import { View, Text, TextInput, Switch, StyleSheet } from "react-native";

import Header from "../components/Header";
import SectionTitle from "../components/SectionTitle";
import Chip from "../components/Chip";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, radius } from "../theme";
import { calculateAttendance } from "../utils/attendance";
import { isValidEmail } from "../utils/email";

// Offering fixed choices removes a whole class of invalid input, and makes
// "change the alert threshold" a one-line edit to this array.
const THRESHOLD_OPTIONS = [70, 75, 80, 85];

/**
 * The email alert settings form.
 *
 * PROPS: settings, courses, onSave
 *
 * The form keeps its own DRAFT copy of the settings while the student types.
 * The real settings in App.js are only replaced when Save is pressed and the
 * draft passes validation, so a half-typed email can never break the alerts.
 */
export default function EmailSettings({ settings, courses, onSave }) {
  const [draft, setDraft] = useState(settings);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // One helper updates any field, so there is no separate handler per input.
  function updateField(field, value) {
    setDraft({ ...draft, [field]: value });
    setSaved(false);
  }

  function validate() {
    const foundErrors = {};

    if (draft.studentName.trim() === "") {
      foundErrors.studentName = "Please enter your name.";
    }

    if (draft.studentEmail.trim() === "") {
      foundErrors.studentEmail = "Email address cannot be empty.";
    } else if (!isValidEmail(draft.studentEmail)) {
      foundErrors.studentEmail = "Enter a valid email, for example name@university.edu";
    }

    return foundErrors;
  }

  function handleSave() {
    const foundErrors = validate();
    setErrors(foundErrors);

    // Object.keys turns the error object into an array so we can count it.
    if (Object.keys(foundErrors).length === 0) {
      onSave(draft);
      setSaved(true);
    } else {
      setSaved(false);
    }
  }

  // How many courses would trigger an alert at the chosen threshold.
  const coursesAtThreshold = courses.filter(
    (course) => calculateAttendance(course) <= draft.threshold
  ).length;

  return (
    <View>
      <Header
        title="Email Alert Settings"
        subtitle="Choose who gets alerted and when."
      />

      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.label}>Student Name</Text>
          <TextInput
            style={[styles.input, errors.studentName && styles.inputError]}
            value={draft.studentName}
            onChangeText={(text) => updateField("studentName", text)}
            placeholder="e.g. Ayesha Khan"
            placeholderTextColor={colors.textMuted}
          />
          {errors.studentName ? (
            <Text style={styles.errorText}>{errors.studentName}</Text>
          ) : null}

          <Text style={styles.label}>Student Email</Text>
          <TextInput
            style={[styles.input, errors.studentEmail && styles.inputError]}
            value={draft.studentEmail}
            onChangeText={(text) => updateField("studentEmail", text)}
            placeholder="name@university.edu"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.studentEmail ? (
            <Text style={styles.errorText}>{errors.studentEmail}</Text>
          ) : null}

          <Text style={styles.label}>Alert Threshold</Text>
          <Text style={styles.helper}>
            Alert me when a course reaches or falls below this percentage.
          </Text>
          <View style={styles.chipRow}>
            {THRESHOLD_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={`${option}%`}
                selected={draft.threshold === option}
                onPress={() => updateField("threshold", option)}
              />
            ))}
          </View>
          <Text style={styles.helper}>
            {coursesAtThreshold === 0
              ? "No course is at or below this threshold right now."
              : `${coursesAtThreshold} course${
                  coursesAtThreshold > 1 ? "s are" : " is"
                } at or below ${draft.threshold}% right now.`}
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Email Alerts</Text>
              <Text style={styles.helper}>
                {draft.alertsEnabled ? "Enabled" : "Disabled"}
              </Text>
            </View>
            <Switch
              value={draft.alertsEnabled}
              onValueChange={(value) => updateField("alertsEnabled", value)}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <PrimaryButton label="Save Settings" onPress={handleSave} style={styles.save} />

          {saved && (
            <View style={styles.success}>
              <Text style={styles.successText}>Settings saved.</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="How Alerts Are Sent" />
        <View style={styles.card}>
          <Text style={styles.infoText}>
            AttendWise prepares the alert and opens your phone's email app with
            the message already written. You stay in control and press send. A
            copy is addressed to the course instructor.
          </Text>
          <Text style={[styles.infoText, styles.infoSpacing]}>
            No email password or API key is stored inside the app, because
            anything placed in a mobile app can be read by whoever installs it.
          </Text>
        </View>
      </View>
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
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.critical,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.critical,
    fontWeight: "600",
  },
  helper: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  save: {
    marginTop: spacing.lg,
  },
  success: {
    marginTop: spacing.md,
    backgroundColor: colors.safeSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  successText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.safe,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  infoSpacing: {
    marginTop: spacing.md,
  },
});
