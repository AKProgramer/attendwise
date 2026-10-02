import React from "react";
import { View, Text, StyleSheet } from "react-native";

import Header from "../components/Header";
import SectionTitle from "../components/SectionTitle";
import AlertCard from "../components/AlertCard";
import EmptyState from "../components/EmptyState";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, radius, getStatusColors } from "../theme";
import { SAFE_ATTENDANCE } from "../utils/attendance";

/**
 * Academic alerts and the history of alerts that were emailed.
 *
 * PROPS: alerts, alertHistory, emailSettings, feedback,
 *        onSendEmail, onOpenSettings
 *
 * `alerts` is not stored anywhere - App.js generates it from the course data
 * on every render, so an alert disappears by itself as soon as the attendance
 * for that course recovers.
 */
export default function Alerts({
  alerts,
  alertHistory,
  emailSettings,
  feedback,
  onSendEmail,
  onOpenSettings,
}) {
  const criticalCount = alerts.filter((alert) => alert.level === "Critical").length;

  return (
    <View>
      <Header
        title="Academic Alerts"
        subtitle={
          alerts.length === 0
            ? "Nothing needs your attention right now."
            : `${alerts.length} course${alerts.length > 1 ? "s" : ""} need attention, ${criticalCount} critical.`
        }
      />

      {/* Feedback after pressing a send button - success or failure. */}
      {feedback ? (
        <View style={styles.section}>
          <View
            style={[
              styles.feedback,
              {
                backgroundColor: feedback.success
                  ? colors.safeSoft
                  : colors.criticalSoft,
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                { color: feedback.success ? colors.safe : colors.critical },
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        </View>
      ) : null}

      {/* A reminder bar when alerts are switched off in settings. */}
      {!emailSettings.alertsEnabled && (
        <View style={styles.section}>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Email alerts are currently disabled.
            </Text>
            <PrimaryButton
              label="Open Settings"
              onPress={onOpenSettings}
              variant="outline"
              style={styles.noticeButton}
            />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <SectionTitle title="Current Alerts" hint="most serious first" />

        {alerts.length === 0 ? (
          <EmptyState
            icon="✅"
            title="Great! You currently have no attendance warnings."
            message={`Every course is at or above ${SAFE_ATTENDANCE}% attendance.`}
          />
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              emailEnabled={emailSettings.alertsEnabled}
              onSendEmail={() => onSendEmail(alert.courseId)}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Email Alert History" hint={`${alertHistory.length} sent`} />

        {alertHistory.length === 0 ? (
          <EmptyState
            icon="📬"
            title="No alerts emailed yet."
            message="Alerts you send will be listed here."
          />
        ) : (
          alertHistory.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyText}>
                <Text style={styles.historyCourse} numberOfLines={1}>
                  {item.course}
                </Text>
                <Text style={styles.historyMeta}>
                  {item.type} · {item.attendance}% · {item.sentAt}
                </Text>
              </View>
              <View
                style={[
                  styles.historyDot,
                  { backgroundColor: getStatusColors(item.type).main },
                ]}
              />
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  feedback: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "700",
  },
  notice: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.warning,
  },
  noticeButton: {
    marginTop: spacing.md,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  historyCourse: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  historyMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
