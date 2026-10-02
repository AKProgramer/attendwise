import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

import Header from "../components/Header";
import SectionTitle from "../components/SectionTitle";
import SummaryCard from "../components/SummaryCard";
import CourseCard from "../components/CourseCard";
import EmptyState from "../components/EmptyState";
import { colors, spacing, radius } from "../theme";
import {
  MIN_ATTENDANCE,
  calculateAttendance,
  calculateOverallAttendance,
  getAttendanceStatus,
  countByStatus,
} from "../utils/attendance";

// Charts need an explicit pixel width, so we measure the device once.
// 32 = screen padding on both sides, 34 = padding + border inside the card.
const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 32 - 34;

const chartConfig = {
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  barPercentage: 0.55,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
};

// Greeting changes with the time of day - a small personalised touch.
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * The dashboard.
 *
 * PROPS: courses, alerts, studentName, onSelectCourse
 *
 * Every number and both charts on this screen are DERIVED from `courses`.
 * Nothing is hardcoded, which is why marking a class present on another
 * screen instantly changes the cards and the charts here.
 */
export default function Dashboard({ courses, alerts, studentName, onSelectCourse }) {
  const overall = calculateOverallAttendance(courses);
  const statusCounts = countByStatus(courses);
  const coursesAtRisk = statusCounts.Warning + statusCounts.Critical;

  // The course in the worst position.
  // reduce() compares two courses at a time and keeps the lower percentage.
  const worstCourse =
    courses.length > 0
      ? courses.reduce((worst, course) =>
          calculateAttendance(course) < calculateAttendance(worst) ? course : worst
        )
      : null;

  // A written recommendation that changes with the data.
  function getInsight() {
    if (statusCounts.Critical > 0) {
      const subject = statusCounts.Critical > 1 ? "courses are" : "course is";
      return `${statusCounts.Critical} ${subject} already below the required ${MIN_ATTENDANCE}%. Attend every remaining class in ${worstCourse.code} to recover.`;
    }
    if (statusCounts.Warning > 0) {
      const subject = statusCounts.Warning > 1 ? "courses are" : "course is";
      return `${statusCounts.Warning} ${subject} close to the ${MIN_ATTENDANCE}% limit. Avoid missing classes in ${worstCourse.code}.`;
    }
    return `All ${courses.length} courses are above ${MIN_ATTENDANCE}%. Keep it up.`;
  }

  function getInsightColor() {
    if (statusCounts.Critical > 0) return colors.criticalSoft;
    if (statusCounts.Warning > 0) return colors.warningSoft;
    return colors.safeSoft;
  }

  // ---- Chart 1 data: one bar per course -----------------------------------
  const barChartData = {
    labels: courses.map((course) => course.code),
    datasets: [{ data: courses.map((course) => calculateAttendance(course)) }],
  };

  // ---- Chart 2 data: one slice per status ---------------------------------
  // filter() removes empty slices so the legend never shows "Critical 0".
  const pieChartData = [
    { name: "Safe", count: statusCounts.Safe, color: colors.safe },
    { name: "Warning", count: statusCounts.Warning, color: colors.warning },
    { name: "Critical", count: statusCounts.Critical, color: colors.critical },
  ]
    .filter((slice) => slice.count > 0)
    .map((slice) => ({
      ...slice,
      legendFontColor: colors.textMuted,
      legendFontSize: 12,
    }));

  return (
    <View>
      <Header
        title={`${getGreeting()}, ${studentName}`}
        subtitle="Here is your academic attendance overview."
      />

      {courses.length === 0 ? (
        // Without courses there is nothing to calculate or chart,
        // so the whole dashboard body is replaced by an empty state.
        <View style={styles.section}>
          <EmptyState
            icon="📚"
            title="No courses available."
            message="Add a course to start tracking your attendance."
          />
        </View>
      ) : (
        <View>
          {/* ---------- Summary cards ---------- */}
          <View style={styles.section}>
            <View style={styles.row}>
              <SummaryCard
                label="Overall Attendance"
                value={`${overall}%`}
                caption={getAttendanceStatus(overall)}
                accent={overall >= MIN_ATTENDANCE ? colors.safe : colors.critical}
              />
              <View style={styles.gap} />
              <SummaryCard label="Courses" value={courses.length} caption="enrolled" />
            </View>

            <View style={[styles.row, styles.rowSpacing]}>
              <SummaryCard
                label="At Risk"
                value={coursesAtRisk}
                caption="warning or critical"
                accent={coursesAtRisk > 0 ? colors.warning : colors.safe}
              />
              <View style={styles.gap} />
              <SummaryCard
                label="Active Alerts"
                value={alerts.length}
                caption={alerts.length === 1 ? "alert" : "alerts"}
                accent={alerts.length > 0 ? colors.critical : colors.safe}
              />
            </View>
          </View>

          {/* ---------- Dynamic recommendation ---------- */}
          <View style={styles.section}>
            <View style={[styles.insight, { backgroundColor: getInsightColor() }]}>
              <Text style={styles.insightLabel}>INSIGHT</Text>
              <Text style={styles.insightText}>{getInsight()}</Text>
            </View>
          </View>

          {/* ---------- Chart 1: Bar ---------- */}
          <View style={styles.section}>
            <View style={styles.card}>
              <SectionTitle title="Attendance by Course" hint="percentage" />
              <BarChart
                data={barChartData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                yAxisLabel=""
                yAxisSuffix="%"
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
              />
            </View>
          </View>

          {/* ---------- Chart 2: Pie ---------- */}
          <View style={styles.section}>
            <View style={styles.card}>
              <SectionTitle title="Attendance Status" hint="number of courses" />
              <PieChart
                data={pieChartData}
                width={chartWidth}
                height={180}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
              />
            </View>
          </View>

          {/* ---------- Needs attention first ---------- */}
          <View style={styles.section}>
            <SectionTitle title="Needs Attention First" hint="lowest attendance" />
            <CourseCard
              course={worstCourse}
              onPress={() => onSelectCourse(worstCourse.id)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: "row",
  },
  rowSpacing: {
    marginTop: spacing.md,
  },
  gap: {
    width: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  chart: {
    marginLeft: -spacing.sm,
    borderRadius: radius.md,
  },
  insight: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  insightLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
    fontWeight: "600",
  },
});
