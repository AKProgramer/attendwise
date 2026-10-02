// Email alert helpers.
//
// HOW THE EMAIL IS SENT
// ---------------------
// The app builds a "mailto:" link and asks the phone to open it. The device's
// own email app then appears with the recipient, subject and message already
// filled in, and the student presses send.
//
// This was chosen on purpose over an email API (SendGrid, EmailJS, ...):
// a React Native app is downloaded onto the user's phone, so any API key put
// in this file would be shipped to every user and could be extracted from the
// bundle. Sending mail automatically needs a backend server that holds the key
// and that the app calls - which is out of scope for this assignment.

import { Linking } from "react-native";
import {
  MIN_ATTENDANCE,
  calculateAttendance,
  calculateClassesToRecover,
} from "./attendance";

/**
 * Very simple email check used by the settings form.
 * It is deliberately readable rather than a long regular expression.
 */
export function isValidEmail(email) {
  const value = email.trim();
  if (value === "") return false;
  if (!value.includes("@")) return false;

  const [name, domain] = value.split("@");
  // exactly one "@", something before it, and a dotted domain after it
  return value.split("@").length === 2 && name.length > 0 && domain.includes(".");
}

/**
 * Builds the subject and body of the alert email for one course.
 * Kept separate from the sending so the text can be read, tested and reused.
 *
 * Template literals are used so every number comes from the live course data.
 */
export function buildAlertEmail(course, emailSettings) {
  const percentage = calculateAttendance(course);
  const classesToRecover = calculateClassesToRecover(course);

  const subject = `Attendance Alert - ${course.name}`;

  const greeting =
    emailSettings.studentName.trim() === ""
      ? "Hello Student,"
      : `Hello ${emailSettings.studentName.trim()},`;

  const situationLine =
    percentage < emailSettings.threshold
      ? `Your attendance has fallen below your alert threshold of ${emailSettings.threshold}%.`
      : `Your attendance is close to your alert threshold of ${emailSettings.threshold}%.`;

  const actionLine =
    classesToRecover > 0
      ? `You need to attend the next ${classesToRecover} classes to get back to ${MIN_ATTENDANCE}%.`
      : `Keep attending to stay above the required ${MIN_ATTENDANCE}%.`;

  const body = [
    greeting,
    "",
    `Your current attendance for ${course.name} (${course.code}) is ${percentage}%.`,
    "",
    `You have attended ${course.attendedClasses} out of ${course.totalClasses} classes.`,
    "",
    situationLine,
    actionLine,
    "",
    "Please review your attendance record and take the necessary action.",
    "",
    "AttendWise",
    "Academic Attendance Monitoring System",
  ].join("\n");

  return { subject, body };
}

/**
 * Opens the device email app with the alert ready to send.
 * Returns { success, message } so the screen can show feedback either way.
 */
export async function sendAttendanceAlert(course, emailSettings) {
  if (!emailSettings.alertsEnabled) {
    return { success: false, message: "Email alerts are turned off in Settings." };
  }

  if (!isValidEmail(emailSettings.studentEmail)) {
    return { success: false, message: "Add a valid email address in Settings first." };
  }

  const { subject, body } = buildAlertEmail(course, emailSettings);

  // encodeURIComponent turns spaces and line breaks into characters that are
  // safe inside a URL, otherwise the body would be cut off at the first space.
  const url =
    `mailto:${emailSettings.studentEmail.trim()}` +
    `?cc=${course.instructorEmail}` +
    `&subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  try {
    await Linking.openURL(url);
    return { success: true, message: `Email alert prepared for ${course.name}.` };
  } catch (error) {
    return { success: false, message: "No email app is available on this device." };
  }
}

/** Formats a date as "12 Sep 2026" for the alert history list. */
export function formatDate(date) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
