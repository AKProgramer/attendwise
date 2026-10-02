// All attendance calculations live here.
//
// Keeping the maths in one file means:
//  - the UI components stay simple and only deal with displaying things
//  - the same calculation is never written twice
//  - changing a rule (e.g. 75% -> 80%) is a single-line edit

// ---------------------------------------------------------------------------
// RULES / THRESHOLDS
// Change these two numbers and the whole application updates:
// percentages, statuses, colours, charts, alerts and email text.
// ---------------------------------------------------------------------------
export const MIN_ATTENDANCE = 75; // university requirement
export const SAFE_ATTENDANCE = 80; // comfortably above the requirement

/**
 * Attendance percentage for one course, rounded to a whole number.
 * Guards against dividing by zero when a course has no classes yet.
 */
export function calculateAttendance(course) {
  if (course.totalClasses === 0) return 0;
  return Math.round((course.attendedClasses / course.totalClasses) * 100);
}

/**
 * Turns a percentage into one of three statuses.
 * This is the single place where the Safe/Warning/Critical rule is defined.
 */
export function getAttendanceStatus(percentage) {
  if (percentage >= SAFE_ATTENDANCE) return "Safe";
  if (percentage >= MIN_ATTENDANCE) return "Warning";
  return "Critical";
}

/**
 * How many upcoming classes the student can miss and still stay >= MIN_ATTENDANCE.
 *
 * Missing a class increases totalClasses but not attendedClasses, so we ask:
 * what is the largest total the student can reach while keeping
 *     attended / total >= MIN_ATTENDANCE / 100
 * Rearranged:  total <= attended * 100 / MIN_ATTENDANCE
 */
export function calculateClassesCanMiss(course) {
  const maxTotalAllowed = Math.floor(
    (course.attendedClasses * 100) / MIN_ATTENDANCE
  );
  const canMiss = maxTotalAllowed - course.totalClasses;
  return canMiss > 0 ? canMiss : 0;
}

/**
 * How many upcoming classes the student must attend in a row to climb back
 * up to MIN_ATTENDANCE.
 *
 * Attending a class increases BOTH counters, so we solve for n in:
 *     (attended + n) / (total + n) >= MIN_ATTENDANCE / 100
 * Rearranged:  n >= (MIN * total - 100 * attended) / (100 - MIN)
 */
export function calculateClassesToRecover(course) {
  const classesNeeded =
    (MIN_ATTENDANCE * course.totalClasses - 100 * course.attendedClasses) /
    (100 - MIN_ATTENDANCE);
  return classesNeeded > 0 ? Math.ceil(classesNeeded) : 0;
}

/**
 * Overall attendance across every course.
 *
 * Uses reduce() to add up all attended and all total classes first, then
 * calculates ONE percentage. This is weighted correctly - averaging the five
 * individual percentages would give a slightly wrong answer because the
 * courses do not all have the same number of classes.
 */
export function calculateOverallAttendance(courses) {
  if (courses.length === 0) return 0;

  const totals = courses.reduce(
    (sum, course) => ({
      attended: sum.attended + course.attendedClasses,
      total: sum.total + course.totalClasses,
    }),
    { attended: 0, total: 0 }
  );

  if (totals.total === 0) return 0;
  return Math.round((totals.attended / totals.total) * 100);
}

/**
 * "What if" projection used by the simulator on the Course Details view.
 * willAttend === true  -> the student attends all the future classes
 * willAttend === false -> the student misses all of them
 */
export function getProjectedAttendance(course, futureClasses, willAttend) {
  const projectedTotal = course.totalClasses + futureClasses;
  const projectedAttended = willAttend
    ? course.attendedClasses + futureClasses
    : course.attendedClasses;

  if (projectedTotal === 0) return 0;
  return Math.round((projectedAttended / projectedTotal) * 100);
}

/**
 * Counts how many courses fall into each status.
 * The Pie Chart on the dashboard is built directly from this object.
 */
export function countByStatus(courses) {
  return courses.reduce(
    (counts, course) => {
      const status = getAttendanceStatus(calculateAttendance(course));
      counts[status] = counts[status] + 1;
      return counts;
    },
    { Safe: 0, Warning: 0, Critical: 0 }
  );
}

/**
 * Builds the academic alerts from the course data.
 * Nothing here is hardcoded - if attendance changes, the alerts change.
 *
 *   filter() -> keep only the courses that are not Safe
 *   map()    -> turn each risky course into an alert object with a message
 *   sort()   -> Critical alerts first, then the lowest attendance first
 */
export function generateAlerts(courses) {
  return courses
    .filter((course) => calculateAttendance(course) < SAFE_ATTENDANCE)
    .map((course) => {
      const percentage = calculateAttendance(course);
      const level = getAttendanceStatus(percentage); // "Warning" or "Critical"

      const message =
        level === "Critical"
          ? `Your attendance in ${course.name} is ${percentage}%. You are below the required ${MIN_ATTENDANCE}% and need to attend the next ${calculateClassesToRecover(
              course
            )} classes to recover.`
          : `Your attendance in ${course.name} is ${percentage}%. You are approaching the minimum ${MIN_ATTENDANCE}% requirement.`;

      return {
        id: course.id,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        attendance: percentage,
        level,
        priority: level === "Critical" ? 1 : 2,
        message,
      };
    })
    .sort((a, b) => a.priority - b.priority || a.attendance - b.attendance);
}
