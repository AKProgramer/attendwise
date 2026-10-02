import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar as AndroidStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import ViewSwitcher from "./src/components/ViewSwitcher";
import Dashboard from "./src/views/Dashboard";
import Courses from "./src/views/Courses";
import CourseDetails from "./src/views/CourseDetails";
import Alerts from "./src/views/Alerts";
import EmailSettings from "./src/views/EmailSettings";

import { initialCourses } from "./src/data/courses";
import {
  MIN_ATTENDANCE,
  calculateAttendance,
  getAttendanceStatus,
  generateAlerts,
} from "./src/utils/attendance";
import { sendAttendanceAlert, formatDate } from "./src/utils/email";
import { colors, spacing } from "./src/theme";

const initialEmailSettings = {
  studentName: "Ayesha Khan",
  studentEmail: "ayesha.khan@university.edu",
  threshold: MIN_ATTENDANCE,
  alertsEnabled: true,
};

/**
 * AttendWise - Attendance Monitoring & Academic Alert System
 *
 * App.js is the only component that stores the application's data. Every
 * screen below it is given what it needs through props and reports changes
 * back through callback props. Keeping one copy of the data is what makes the
 * whole app stay in step: pressing "Mark Present" changes `courses` here, and
 * the dashboard, the charts, the course list and the alerts all re-render
 * from that same updated array.
 */
export default function App() {
  // ---- Application state --------------------------------------------------
  const [courses, setCourses] = useState(initialCourses);
  const [currentView, setCurrentView] = useState("dashboard");
  const [returnView, setReturnView] = useState("courses");
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("lowest");

  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);
  const [alertHistory, setAlertHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // ---- Derived data (calculated, never stored) ----------------------------
  const alerts = generateAlerts(courses);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  const greetingName =
    emailSettings.studentName.trim() === ""
      ? "Student"
      : emailSettings.studentName.trim().split(" ")[0];

  // ---- Event handlers -----------------------------------------------------
  function handleChangeView(view) {
    setCurrentView(view);
    setFeedback(null);
  }

  function handleSelectCourse(courseId) {
    setSelectedCourseId(courseId);
    setReturnView(currentView); // so Back returns where the student came from
    setCurrentView("details");
  }

  /**
   * Adds one class to a course.
   * Present -> attended and total both go up. Absent -> only total goes up.
   *
   * map() builds a NEW array and the spread operator builds a NEW object for
   * the one course that changed. State is never edited in place, which is how
   * React knows something changed and re-renders.
   */
  function handleMarkAttendance(courseId, wasPresent) {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              totalClasses: course.totalClasses + 1,
              attendedClasses: wasPresent
                ? course.attendedClasses + 1
                : course.attendedClasses,
            }
          : course
      )
    );
  }

  async function handleSendEmail(courseId) {
    const course = courses.find((item) => item.id === courseId);
    if (!course) return;

    const result = await sendAttendanceAlert(course, emailSettings);
    setFeedback(result);

    if (result.success) {
      const percentage = calculateAttendance(course);
      setAlertHistory([
        {
          id: Date.now(),
          course: course.name,
          type: getAttendanceStatus(percentage),
          attendance: percentage,
          sentAt: formatDate(new Date()),
        },
        ...alertHistory, // newest first
      ]);
    }
  }

  function handleSaveSettings(newSettings) {
    setEmailSettings(newSettings);
  }

  // ---- View switching -----------------------------------------------------
  // This is what replaces a navigation library: one piece of state decides
  // which component is rendered.
  function renderCurrentView() {
    if (currentView === "courses") {
      return (
        <Courses
          courses={courses}
          searchQuery={searchQuery}
          filter={filter}
          sortBy={sortBy}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilter}
          onSortChange={setSortBy}
          onSelectCourse={handleSelectCourse}
        />
      );
    }

    // If the selected course was somehow removed, fall back to the list.
    if (currentView === "details" && selectedCourse) {
      return (
        <CourseDetails
          course={selectedCourse}
          onBack={() => setCurrentView(returnView)}
          onMarkPresent={() => handleMarkAttendance(selectedCourse.id, true)}
          onMarkAbsent={() => handleMarkAttendance(selectedCourse.id, false)}
        />
      );
    }

    if (currentView === "alerts") {
      return (
        <Alerts
          alerts={alerts}
          alertHistory={alertHistory}
          emailSettings={emailSettings}
          feedback={feedback}
          onSendEmail={handleSendEmail}
          onOpenSettings={() => handleChangeView("settings")}
        />
      );
    }

    if (currentView === "settings") {
      return (
        <EmailSettings
          settings={emailSettings}
          courses={courses}
          onSave={handleSaveSettings}
        />
      );
    }

    return (
      <Dashboard
        courses={courses}
        alerts={alerts}
        studentName={greetingName}
        onSelectCourse={handleSelectCourse}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Text style={styles.brandName}>AttendWise</Text>
          <Text style={styles.brandTag}>Attendance Monitor</Text>
        </View>

        {/* The switcher is hidden on the details screen, which has its own
            Back button instead. */}
        {currentView !== "details" && (
          <ViewSwitcher
            current={currentView}
            onChange={handleChangeView}
            alertCount={alerts.length}
          />
        )}

        {renderCurrentView()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? AndroidStatusBar.currentHeight : 0,
  },
  scroll: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  brand: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.3,
  },
  brandTag: {
    marginLeft: spacing.sm,
    fontSize: 11,
    color: colors.textMuted,
  },
});
