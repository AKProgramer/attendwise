import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import Header from "../components/Header";
import SectionTitle from "../components/SectionTitle";
import CourseCard from "../components/CourseCard";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import { colors, spacing, radius } from "../theme";
import { calculateAttendance, getAttendanceStatus } from "../utils/attendance";

// The options are data, so the rows of chips are built with map() instead of
// being written out one by one. Adding "Archived" later is a one-line change.
const FILTER_OPTIONS = ["All", "Safe", "Warning", "Critical"];

const SORT_OPTIONS = [
  { key: "lowest", label: "Lowest %" },
  { key: "highest", label: "Highest %" },
  { key: "name", label: "Name A-Z" },
];

/**
 * The course list with search, filtering and sorting.
 *
 * PROPS: courses, searchQuery, filter, sortBy, onSelectCourse,
 *        onSearchChange, onFilterChange, onSortChange
 *
 * This screen owns no data of its own. It receives the full course list and
 * the current search/filter/sort choices as props, and reports every change
 * back up to App.js through the callback props.
 */
export default function Courses({
  courses,
  searchQuery,
  filter,
  sortBy,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onSelectCourse,
}) {
  // --- 1. SEARCH: match the typed text against the name or the code --------
  const searchText = searchQuery.trim().toLowerCase();

  const searchedCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchText) ||
      course.code.toLowerCase().includes(searchText)
  );

  // --- 2. FILTER: keep only the chosen status -----------------------------
  const filteredCourses = searchedCourses.filter((course) => {
    if (filter === "All") return true;
    return getAttendanceStatus(calculateAttendance(course)) === filter;
  });

  // --- 3. SORT -------------------------------------------------------------
  // sort() changes the array it is given, but filter() above already returned
  // a brand new array, so the original `courses` state is never mutated.
  const visibleCourses = filteredCourses.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "highest") return calculateAttendance(b) - calculateAttendance(a);
    return calculateAttendance(a) - calculateAttendance(b); // "lowest"
  });

  return (
    <View>
      <Header
        title="My Courses"
        subtitle="Search, filter and open a course for details."
      />

      <View style={styles.section}>
        {/* Controlled input: its value comes from state and every keystroke
            sends the new text back up with onChangeText. */}
        <TextInput
          style={styles.search}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search by course name or code"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        <Text style={styles.groupLabel}>FILTER BY STATUS</Text>
        <View style={styles.chipRow}>
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={filter === option}
              onPress={() => onFilterChange(option)}
            />
          ))}
        </View>

        <Text style={styles.groupLabel}>SORT BY</Text>
        <View style={styles.chipRow}>
          {SORT_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={sortBy === option.key}
              onPress={() => onSortChange(option.key)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Courses"
          hint={`${visibleCourses.length} of ${courses.length}`}
        />

        {/* Three different situations are handled here:
            no courses at all, a search/filter that matched nothing,
            and the normal list. */}
        {courses.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No courses available."
            message="There are no courses in your record yet."
          />
        ) : visibleCourses.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matching courses found."
            message="Try a different search term or choose the All filter."
          />
        ) : (
          visibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => onSelectCourse(course.id)}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
