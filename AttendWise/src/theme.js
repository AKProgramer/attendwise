// Central design tokens.
// Every component imports from here so colours and spacing stay consistent,
// and a theme change only needs to be made in one place.

export const colors = {
  background: "#F3F5FA",
  surface: "#FFFFFF",
  primary: "#2563EB",
  primarySoft: "#E0EAFF",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",

  safe: "#16A34A",
  safeSoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  critical: "#DC2626",
  criticalSoft: "#FEE2E2",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 8, md: 12, lg: 18 };

// One helper that maps an attendance status to its colour pair.
// Used by StatusBadge, ProgressBar, CourseCard, AlertCard and the pie chart,
// so "Critical" always looks the same everywhere in the app.
export function getStatusColors(status) {
  if (status === "Safe") return { main: colors.safe, soft: colors.safeSoft };
  if (status === "Warning") return { main: colors.warning, soft: colors.warningSoft };
  return { main: colors.critical, soft: colors.criticalSoft };
}
