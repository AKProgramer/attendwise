# AttendWise — Attendance Monitoring & Academic Alert System

A React Native (Expo) mobile application that helps university students track their
attendance course-by-course, see which subjects are becoming risky, and send
themselves an academic alert by email before it is too late.

**Software for Mobile Devices — Assignment 1**

---

## 1. Problem Statement

University attendance rules are strict: fall below **75%** in a course and you can be
barred from the final exam. The existing student portal shows raw numbers like
`17 / 20` and nothing else. In practice this means:

- Students do not notice a course slipping until it is already below the limit.
- Nobody wants to do the arithmetic for five courses every week.
- The two questions that actually matter are never answered:
  - *"How many more classes can I afford to miss?"*
  - *"I'm already short — how many must I attend to recover?"*
- There is no warning, no priority order, and no reminder.

The information exists, but it is not turned into a decision.

## 2. Proposed Solution

AttendWise reads the same raw counts and turns them into **advice and alerts**.

- Every percentage, status and warning is **calculated from the attendance data**,
  so the app is always consistent with reality.
- Courses are automatically classified **Safe / Warning / Critical**.
- Alerts are **generated**, not written by hand, and are sorted so the most serious
  course appears first.
- A **What If calculator** lets the student test a decision ("I want to skip the next
  3 classes") *before* making it.
- An **email alert** can be prepared for any at-risk course, addressed to the student
  with a copy to the instructor.

## 3. Main Features

| Feature | Screen | What it does |
|---|---|---|
| Personalised dashboard | Dashboard | Greeting changes with the time of day; four summary cards computed from the data |
| **Bar chart** — Attendance by Course | Dashboard | One bar per course, labelled with the course code |
| **Pie chart** — Attendance Status | Dashboard | How many courses are Safe / Warning / Critical |
| Dynamic insight | Dashboard | A written recommendation that changes with the data |
| Needs Attention First | Dashboard | Highlights the single worst course, tap to open it |
| Course list | Courses | Cards generated from the data with progress bars and status badges |
| Search | Courses | Live search by course name **or** course code |
| Status filter | Courses | All / Safe / Warning / Critical |
| Sorting | Courses | Lowest %, Highest %, Name A–Z |
| Full course breakdown | Course Details | Instructor, attended, missed, total, percentage, status |
| Classes you can miss | Course Details | How many classes can still be skipped while staying ≥ 75% |
| Classes to recover | Course Details | How many classes in a row are needed to get back to 75% |
| Mark Present / Mark Absent | Course Details | Changes the real attendance record and updates the whole app |
| **What If calculator** | Course Details | Projects attendance if the next *N* classes are attended or missed, with input validation |
| Automatic academic alerts | Alerts | Generated from the data, Critical before Warning |
| Email alert | Alerts | Opens the phone's email app with the message pre-written |
| Alert history | Alerts | A log of the alerts that were sent |
| Email settings | Settings | Name, email, alert threshold, on/off switch, with validation |
| Empty states | Everywhere | No courses, no alerts, no search results, no history |

## 4. Technologies Used

| Technology | Purpose |
|---|---|
| React Native 0.86 | The mobile application framework |
| Expo SDK 57 | Project tooling and running the app on a phone |
| JavaScript (ES6+) | All application code — **no TypeScript** |
| React function components + Hooks | `useState` for every piece of state |
| react-native-chart-kit 7 | The bar chart and the pie chart |
| react-native-svg | Rendering engine required by the charts |
| React Native `Linking` | Opens the device email app (built in, no extra package) |

**No navigation library is used.** There is no React Navigation, no bottom tab bar
and no drawer — the assignment specifically penalises these. Views are switched with
a single piece of React state (see section 8).

## 5. React Concepts Demonstrated

| Concept | Where to find it |
|---|---|
| **Components** | 11 reusable components in `src/components/`, 5 views in `src/views/` |
| **Props** | Every component is configured only through props, e.g. `<SummaryCard label="Courses" value={5} />` |
| **useState** | `courses`, `currentView`, `selectedCourseId`, `searchQuery`, `filter`, `sortBy`, `emailSettings`, `alertHistory`, `feedback` in `App.js`; `futureClasses` and `simulation` in `CourseDetails.js`; `draft` and `errors` in `EmailSettings.js` |
| **Events** | `onPress` on every button and card, `onChangeText` on every input, `onValueChange` on the Switch |
| **Conditional rendering** | View switching in `App.js`, empty states, validation messages, the disabled email button, the simulation result block |
| **Lists / keys** | `courses.map()`, `alerts.map()`, `alertHistory.map()`, the filter and sort chips |
| **Controlled inputs** | Search box, What If input, name and email fields |
| **Lifting state up** | `CourseDetails` does not change attendance itself — it calls `onMarkPresent`, and `App.js` updates the data |
| **Derived state** | Percentages, statuses, alerts and chart data are recalculated on render rather than stored |

## 6. JavaScript Concepts Demonstrated

| Concept | Example |
|---|---|
| **Objects** | Each course is an object; `emailSettings` and each alert are objects |
| **Arrays** | `initialCourses`, `alerts`, `alertHistory`, `FILTER_OPTIONS`, `SORT_OPTIONS` |
| `map()` | Builds the course cards, the alert cards, the chip rows, and the new array when attendance changes |
| `filter()` | Search, the status filter, dropping empty pie slices, choosing which courses are risky |
| `sort()` | Ordering courses, and ordering alerts Critical-first |
| `reduce()` | `calculateOverallAttendance()` and `countByStatus()`, and finding the worst course |
| `find()` | Getting the selected course from its id in `App.js` |
| **Spread operator** | `{ ...course, totalClasses: course.totalClasses + 1 }` — updating state without mutating it |
| **Template literals** | The whole email body, `` `${percentage}%` ``, every dynamic message |
| **Conditions** | `getAttendanceStatus()`, validation, all the advice text |
| **Functions** | Eight pure calculation functions in `utils/attendance.js` |
| **Regular expression** | `/^\d+$/` validates the What If input |
| **Destructuring** | Props in every component, `const { subject, body } = buildAlertEmail(...)` |
| **async / await** | `sendAttendanceAlert()` opening the email app |

## 7. Application Structure

```
AttendWise/
├── App.js                      State owner + view switching
├── index.js                    Expo entry point
├── app.json                    Expo configuration
└── src/
    ├── theme.js                Colours, spacing, status→colour helper
    ├── data/
    │   └── courses.js          The 5 sample courses
    ├── utils/
    │   ├── attendance.js       All attendance maths + the thresholds
    │   └── email.js            Email text + sending + email validation
    ├── components/             Reusable, presentational
    │   ├── Header.js
    │   ├── ViewSwitcher.js
    │   ├── SectionTitle.js
    │   ├── SummaryCard.js
    │   ├── StatusBadge.js
    │   ├── ProgressBar.js
    │   ├── CourseCard.js
    │   ├── AlertCard.js
    │   ├── Chip.js
    │   ├── PrimaryButton.js
    │   └── EmptyState.js
    └── views/
        ├── Dashboard.js
        ├── Courses.js
        ├── CourseDetails.js
        ├── Alerts.js
        └── EmailSettings.js
```

### How view switching works (instead of React Navigation)

`App.js` keeps one piece of state:

```js
const [currentView, setCurrentView] = useState("dashboard");
```

`renderCurrentView()` then returns a different component depending on its value, and
the buttons at the top simply call `setCurrentView("courses")`. That is the entire
navigation system — no library, no stack, no tab bar.

### Data flow

```
          App.js  ──  courses, emailSettings, alertHistory  (the only stored data)
             │
   props ────┼──── callbacks
             ▼
   Dashboard · Courses · CourseDetails · Alerts · EmailSettings
```

Views never hold the course data. When `CourseDetails` needs to change attendance it
calls the `onMarkPresent` prop, `App.js` updates `courses`, and **every** screen
re-renders from the new array. This is why the charts, the summary cards and the
alerts all change at the same time.

## 8. Attendance Calculation Logic

All of it lives in `src/utils/attendance.js`, and all of it is driven by two
constants:

```js
export const MIN_ATTENDANCE  = 75;  // university requirement
export const SAFE_ATTENDANCE = 80;  // comfortably above the requirement
```

**Percentage** — never stored, always calculated:
```js
Math.round((attendedClasses / totalClasses) * 100)   // 0 if totalClasses is 0
```

**Status**
| Attendance | Status |
|---|---|
| ≥ 80% | Safe |
| 75% – 79% | Warning |
| < 75% | Critical |

**Classes you can miss** — missing a class raises `total` but not `attended`, so the
largest total the student may reach is `attended × 100 ÷ 75`:
```js
Math.floor((attended * 100) / MIN_ATTENDANCE) - total     // never below 0
```

**Classes needed to recover** — attending raises *both* counters, so solving
`(attended + n) / (total + n) ≥ 0.75` gives:
```js
Math.ceil((MIN_ATTENDANCE * total - 100 * attended) / (100 - MIN_ATTENDANCE))
```
*Example:* Artificial Intelligence is 13/19 = 68%. The formula gives 5, and indeed
18/24 = exactly 75%.

**Overall attendance** — `reduce()` adds up all attended and all total classes first
and then takes a single percentage. Averaging the five individual percentages would
be wrong, because the courses do not have the same number of classes.

**Projection (What If)**
```js
attend: (attended + n) / (total + n)
miss:    attended      / (total + n)
```

**Alert generation** — `filter` the courses that are not Safe → `map` each into an
alert object with a written message → `sort` so Critical comes before Warning, and
within the same level the lower attendance comes first.

## 9. Email Alert Logic

`src/utils/email.js` has three parts:

1. `isValidEmail(email)` — used by the settings form.
2. `buildAlertEmail(course, emailSettings)` — builds the subject and the body from
   live data using template literals.
3. `sendAttendanceAlert(course, emailSettings)` — refuses to run if alerts are off or
   the email is invalid, then builds a `mailto:` link and opens it.

Example generated message:

```
Subject: Attendance Alert - Artificial Intelligence

Hello Ayesha Khan,

Your current attendance for Artificial Intelligence (CS408) is 68%.

You have attended 13 out of 19 classes.

Your attendance has fallen below your alert threshold of 75%.
You need to attend the next 5 classes to get back to 75%.

Please review your attendance record and take the necessary action.

AttendWise
Academic Attendance Monitoring System
```

### Why `mailto:` and not an email API

A React Native app is installed on the user's phone, so **anything inside the app
bundle can be extracted** — including an API key. Putting a SendGrid or EmailJS key in
the source would leak it to every user and let anyone send mail from the account.
Sending mail automatically requires a backend server that holds the key and that the
app calls over HTTPS, which is outside the scope of this assignment.

Opening the device's mail app is the honest alternative: no secret is stored, it works
on a real phone, the student can read the message before it goes, and it is about
fifteen lines of code. The recipient is the student, with the course instructor copied.

> If a real sending service were required, the safe design would be:
> app → your own backend endpoint (e.g. `POST /api/alerts`) → the backend holds the
> API key in a server-side environment variable and calls the email provider.

## 10. Application States Handled

| State | What happens |
|---|---|
| Safe attendance | Green badge, "you can miss N classes" |
| Warning attendance | Amber badge, warning alert generated |
| Critical attendance | Red badge, critical alert, recovery advice |
| No courses | Dashboard and Courses show "No courses available." and no charts are drawn |
| No alerts | "Great! You currently have no attendance warnings." |
| Search matches nothing | "No matching courses found." |
| No alerts emailed yet | "No alerts emailed yet." |
| Invalid What If input | Red border and a specific message; both buttons disabled |
| Invalid email input | Red border and a message; settings are not saved |
| Email alerts disabled | Send buttons disabled, a notice with a shortcut to Settings |
| Attendance changed | Percentage, status, colours, both charts, alerts and the dashboard all update |

## 11. Installation Instructions

**Requirements:** Node.js 18 or newer, and the **Expo Go** app on your phone
(App Store / Play Store).

```bash
git clone <your-repository-url>
cd AttendWise
npm install
```

## 12. How to Run with Expo

```bash
npx expo start
```

A QR code appears in the terminal.

- **Android:** open Expo Go → *Scan QR code*.
- **iOS:** scan the QR code with the Camera app.
- **Emulator:** press `a` for an Android emulator or `i` for an iOS simulator.

The phone and the computer must be on the same Wi-Fi network. If that is not possible,
run `npx expo start --tunnel`.

## 13. AI Usage

AI assistance (Claude) was used during development, as permitted by the assignment:

- **Ideation** — shortlisting which attendance features would be genuinely useful
  rather than decorative.
- **Code generation** — first drafts of the components, the views and the styling.
- **Explanation** — understanding how `react-native-chart-kit` expects its data.

What was reviewed, changed or rejected:

- The attendance formulas were **derived and checked by hand** against boundary cases
  (exactly 75%, 0 total classes, an empty course list) rather than trusted as written.
- An early suggestion to use React Navigation was **rejected**, because the assignment
  penalises navigation code; state-based view switching was used instead.
- A suggestion to send email through an API key embedded in the app was **rejected**
  for the security reason explained in section 9.
- `expo-linking` was installed and then **removed** once it became clear React Native's
  built-in `Linking` does the same job with one less dependency.
- Threshold numbers that had been written inline were **replaced by the two constants**
  so the rules can be changed in one place.

A full AI usage report is submitted separately using the provided template.

## 14. Possible Future Improvements

- Save data with `AsyncStorage` so it survives closing the app.
- Connect to the real university portal API instead of sample data.
- A small backend so alerts can be sent automatically on a schedule.
- Per-class attendance history with dates, instead of running totals.
- Timetable-aware reminders ("you have Database Systems in 1 hour, and you cannot
  afford to miss it").
