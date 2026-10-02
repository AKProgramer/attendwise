import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";

// The four top-level views. Rendering this list with map() means adding a new
// view is a one-line change here, not four copies of the same button.
const VIEWS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "courses", label: "Courses" },
  { key: "alerts", label: "Alerts" },
  { key: "settings", label: "Settings" },
];

/**
 * A row of buttons at the TOP of the screen used to switch views.
 * This replaces a navigation library: pressing a button only changes a piece
 * of state in App.js, which then renders a different component.
 *
 * PROPS:
 *   current    - the key of the active view
 *   onChange   - function called with the new view key
 *   alertCount - number shown as a badge on the Alerts button
 */
export default function ViewSwitcher({ current, onChange, alertCount }) {
  return (
    <View style={styles.row}>
      {VIEWS.map((view) => {
        const isActive = view.key === current;

        return (
          <Pressable
            key={view.key}
            onPress={() => onChange(view.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {view.label}
            </Text>

            {/* The badge only appears when there is something to report */}
            {view.key === "alerts" && alertCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{alertCount}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  labelActive: {
    color: "#FFFFFF",
  },
  badge: {
    marginLeft: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.critical,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
