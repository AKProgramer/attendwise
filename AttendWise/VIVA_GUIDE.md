# AttendWise — Viva Preparation Guide

Plain-English explanations of everything in the project, followed by likely questions
with short answers you can actually say out loud.

---

## 1. Application Structure

Think of the app as three layers.

**Layer 1 — the data and the maths** (`src/data/` and `src/utils/`)
These files contain no screens at all. `courses.js` is just a list of course objects.
`attendance.js` contains the calculations. `email.js` writes and sends the email.

**Layer 2 — small reusable pieces** (`src/components/`)
Eleven small components. Each one knows how to *display* one thing: a button, a badge,
a progress bar, a card. None of them store data.

**Layer 3 — the screens** (`src/views/` and `App.js`)
`App.js` holds all the data and decides which screen to show. The five view files
arrange the small components into a full screen.

> **Say this:** "The maths is separate from the UI, the UI is built from small reusable
> components, and `App.js` holds the data and chooses which screen is visible."

## 2. Why Components Were Used

The course list shows five courses. Without a component I would have to copy the same
block of JSX five times. If I then wanted to change the card design, I would have to
change it in five places and would probably miss one.

Instead there is **one** `CourseCard` component, used five times with different data.
`StatusBadge` is used in the course list, in the course details and in every alert — in
three different screens — and they always look identical because it is one file.

`EmptyState` is the clearest example: the app has four different "nothing here"
situations (no courses, no alerts, no search results, no sent alerts) and all four use
the same component with different text.

## 3. What Props Are

Props are the values a parent component passes down to a child. They are like the
arguments of a function. **A component cannot change its own props** — only the parent
can give it different ones.

```js
<SummaryCard label="Courses" value={5} caption="enrolled" />
```

`SummaryCard` receives `label`, `value` and `caption` and just displays them.

## 4. Where Props Are Used

| Component | Props it receives |
|---|---|
| `SummaryCard` | `label`, `value`, `caption`, `accent` |
| `CourseCard` | `course` (the whole object), `onPress` |
| `StatusBadge` | `status`, `small` |
| `ProgressBar` | `percentage` |
| `PrimaryButton` | `label`, `onPress`, `variant`, `disabled` |
| `AlertCard` | `alert`, `onSendEmail`, `emailEnabled` |
| `EmptyState` | `icon`, `title`, `message` |
| `Chip` | `label`, `selected`, `onPress` |
| `CourseDetails` | `course`, `onBack`, `onMarkPresent`, `onMarkAbsent` |

Notice that some props are **data** (`course`, `label`) and some are **functions**
(`onPress`, `onMarkPresent`). The function props are how a child tells its parent that
something happened — the child cannot change the data itself, so it reports upwards.

## 5. What State Is

State is data that belongs to a component and that **can change while the app is
running**. When state changes, React automatically re-renders the component.

Props come from outside and cannot be changed by the component. State lives inside and
can.

## 6. Where useState Is Used

**In `App.js`** (the data the whole app shares):

```js
const [courses, setCourses]                   = useState(initialCourses);
const [currentView, setCurrentView]           = useState("dashboard");
const [returnView, setReturnView]             = useState("courses");
const [selectedCourseId, setSelectedCourseId] = useState(null);
const [searchQuery, setSearchQuery]           = useState("");
const [filter, setFilter]                     = useState("All");
const [sortBy, setSortBy]                     = useState("lowest");
const [emailSettings, setEmailSettings]       = useState(initialEmailSettings);
const [alertHistory, setAlertHistory]         = useState([]);
const [feedback, setFeedback]                 = useState(null);
```

**In `CourseDetails.js`** (only this screen cares about it):
`futureClasses` (what the user typed) and `simulation` (which question was asked).

**In `EmailSettings.js`**: `draft` (the half-edited form), `errors`, `saved`.

> **Important point to make:** state is only put in `App.js` when more than one screen
> needs it. The What If input is local, because no other screen cares about it.

### Why state is never edited directly

```js
// WRONG - React cannot tell anything changed
course.attendedClasses = course.attendedClasses + 1;

// RIGHT - a new array with a new object inside it
setCourses(
  courses.map((course) =>
    course.id === courseId
      ? { ...course, totalClasses: course.totalClasses + 1 }
      : course
  )
);
```

React compares the old value with the new one. If you edit the original object, the old
and new are the *same* object, so React sees no change and the screen does not update.

## 7. How Conditional Rendering Works

Showing different JSX depending on a condition. The app uses three forms:

**`&&` — show something or nothing**
```js
{onBack && <Pressable onPress={onBack}>...</Pressable>}
```
The Back button only exists when an `onBack` function was passed.

**Ternary `? :` — show one thing or another**
```js
{courses.length === 0 ? <EmptyState ... /> : courses.map(...)}
```

**`if` inside a function — choose a whole screen**
```js
if (currentView === "alerts") return <Alerts ... />;
```

Other examples: the validation message only appears when there is an error, the
simulation result only appears after a button is pressed, and the Send Email button is
disabled when alerts are switched off.

## 8. How Attendance Percentage Is Calculated

```js
export function calculateAttendance(course) {
  if (course.totalClasses === 0) return 0;
  return Math.round((course.attendedClasses / course.totalClasses) * 100);
}
```

Two things worth pointing out:

1. The `if` guards against dividing by zero — a brand new course with no classes would
   otherwise produce `NaN` and the chart would break.
2. The percentage is **not stored** in the course object. It is calculated every time it
   is needed. That means it is impossible for the stored percentage and the real counts
   to disagree.

## 9. How Alerts Are Generated

No alert is written by hand. `generateAlerts(courses)` does three things in a chain:

```js
return courses
  .filter((course) => calculateAttendance(course) < SAFE_ATTENDANCE)  // 1
  .map((course) => { ... return alertObject; })                       // 2
  .sort((a, b) => a.priority - b.priority || a.attendance - b.attendance); // 3
```

1. **filter** — keep only courses under 80%. A Safe course produces no alert.
2. **map** — turn each risky course into an alert object, and choose the wording:
   below 75% gets a Critical message that includes the recovery number, between 75 and
   79 gets a Warning message.
3. **sort** — `priority` is 1 for Critical and 2 for Warning, so Critical comes first.
   If two alerts have the same priority, the `||` part breaks the tie by putting the
   lower attendance first.

Because this runs on every render, an alert **disappears by itself** as soon as you
mark enough classes present.

## 10. How map(), filter(), sort(), find() and reduce() Are Used

| Method | Where | What it does there |
|---|---|---|
| `map()` | `Courses.js` | Turns each course object into a `<CourseCard />` |
| `map()` | `App.js` | Builds a **new** course array when attendance changes |
| `map()` | `Dashboard.js` | Builds the chart labels and the chart numbers |
| `filter()` | `Courses.js` | Search (name or code) and the status filter |
| `filter()` | `attendance.js` | Keeps only the courses that deserve an alert |
| `filter()` | `Dashboard.js` | Removes pie slices whose count is 0 |
| `sort()` | `Courses.js` | Lowest %, highest %, or name |
| `sort()` | `attendance.js` | Critical alerts before Warning alerts |
| `find()` | `App.js` | `courses.find(c => c.id === selectedCourseId)` gets the open course |
| `reduce()` | `attendance.js` | Adds up all attended and all total classes for the overall % |
| `reduce()` | `attendance.js` | `countByStatus` counts Safe / Warning / Critical |
| `reduce()` | `Dashboard.js` | Finds the single worst course |

**A good detail to mention:** `sort()` normally damages the array it is given, which
would be mutating state. In `Courses.js` it is safe because `filter()` has already
returned a brand new array, so the original `courses` state is untouched.

## 11. How the Dashboard Values Are Calculated

Nothing on the dashboard is typed in by hand.

| Card | Where the number comes from |
|---|---|
| Overall Attendance | `calculateOverallAttendance(courses)` — a `reduce()` over all courses |
| Courses | `courses.length` |
| At Risk | `countByStatus()` → `Warning + Critical` |
| Active Alerts | `alerts.length`, and `alerts` itself is generated from the courses |

The **overall percentage** is the part to explain carefully. It adds up *all* attended
classes and *all* total classes first, then divides once:

```
(17+20+17+15+13) / (20+22+22+19+19) = 82 / 102 = 80%
```

Averaging the five percentages instead would give a slightly different, wrong answer,
because the courses do not all have the same number of classes.

## 12. How Charts Receive Their Data

Both charts are from `react-native-chart-kit` and both are built from `courses`.

**Bar chart** — it wants labels and a dataset of numbers:
```js
const barChartData = {
  labels:   courses.map((course) => course.code),
  datasets: [{ data: courses.map((course) => calculateAttendance(course)) }],
};
```

**Pie chart** — it wants an array of objects and the name of the field to read, which
is given with `accessor="count"`:
```js
const pieChartData = [
  { name: "Safe",     count: statusCounts.Safe,     color: colors.safe },
  { name: "Warning",  count: statusCounts.Warning,  color: colors.warning },
  { name: "Critical", count: statusCounts.Critical, color: colors.critical },
].filter((slice) => slice.count > 0);
```

The `.filter()` removes slices with zero courses, so the legend never shows
"Critical 0".

Charts need a width in pixels, so the screen is measured once with
`Dimensions.get("window").width`.

**Why the charts update by themselves:** they are not stored in state. Both are built
from `courses` during render. When `courses` changes, the component renders again, both
data objects are rebuilt, and the charts redraw.

## 13. How Email Alerts Work

Pressing **Send Email Alert** runs `handleSendEmail(courseId)` in `App.js`:

1. `find()` the course by its id.
2. Call `sendAttendanceAlert(course, emailSettings)`.
3. That function refuses if alerts are switched off or the email address is invalid.
4. `buildAlertEmail()` writes the subject and body using template literals and the live
   numbers.
5. A `mailto:` link is built, with `encodeURIComponent()` applied to the subject and
   body — without it the message would be cut off at the first space.
6. `Linking.openURL(url)` asks the phone to open its email app, which appears with
   everything filled in.
7. The result is stored in `feedback` so the screen can show a success or failure
   message, and on success a record is added to `alertHistory`.

**Why not send it automatically?** An API key placed in a React Native app ships to
every user's phone and can be extracted from the bundle. Sending mail automatically
needs a backend server that keeps the key secret. `mailto:` stores no secret, works on a
real device, and lets the student read the message before it goes.

## 14. Why Reusable Components Were Created

Three concrete reasons:

1. **No duplication.** One `CourseCard` file instead of five copies of the same JSX.
2. **Consistency by construction.** `StatusBadge` works the colour out from the status
   itself, so "Critical" is the same red in the course list, the details screen and the
   alerts. It is impossible to get it wrong in one place.
3. **Changes happen once.** Making every button slightly rounder is one edit in
   `PrimaryButton.js`, not fifteen edits spread across five screens.

## 15. Why View Switching Instead of React Navigation

- **The assignment requires it.** It states that adding navigation code leads to
  negative marking and that views should be switched as discussed in class.
- **The app does not need it.** React Navigation adds a stack, a history, gestures and
  several packages. This app has five flat screens and one Back button.
- **It is less code.** The whole navigation system is one state variable and a function
  of `if` statements — about fifteen lines, all of which I can explain.

```js
const [currentView, setCurrentView] = useState("dashboard");
// a button does this:
onPress={() => setCurrentView("courses")}
// and the render picks the matching screen
if (currentView === "courses") return <Courses ... />;
```

The one thing that was handled deliberately: the Back button on Course Details returns
to wherever you came from, because `returnView` remembers the previous view.

---

# Likely Viva Questions and Short Answers

### Structure

**Q: Walk me through your application structure.**
Three layers. `src/data` and `src/utils` hold the course data and all the calculations
with no UI. `src/components` holds eleven small reusable display components.
`src/views` holds the five screens, and `App.js` holds all the state and decides which
screen is rendered.

**Q: Why is `App.js` the only file with the course data?**
So there is a single source of truth. If each screen kept its own copy they could
disagree. With one copy, changing attendance updates the dashboard, the charts, the
course list and the alerts all at once.

**Q: What would you put in a component versus a view?**
A component displays one small thing and holds no data. A view arranges components into
a full screen and receives everything it needs as props.

### React

**Q: What is the difference between props and state?**
Props are passed in from the parent and the component cannot change them. State belongs
to the component and can change, and changing it causes a re-render.

**Q: Show me a place you used conditional rendering and say why.**
The Courses screen. If there are no courses at all I show "No courses available." If
there are courses but the search matched none, I show "No matching courses found." They
are different problems, so the user gets different advice.

**Q: Why does `CourseDetails` not update the attendance itself?**
It does not own the data. It calls the `onMarkPresent` prop, and `App.js` updates
`courses`. That is lifting state up, and it is what keeps the other screens in step.

**Q: Why do you use the spread operator in `handleMarkAttendance`?**
To create a new object instead of editing the old one. React compares references — if I
changed the original object, the old and new would be the same object and React would
not re-render.

**Q: Why is `futureClasses` in `CourseDetails` and not in `App.js`?**
Because no other screen needs it. State should live at the lowest level that still works.

**Q: Where are keys used and why?**
On every `.map()` that produces elements — course cards, alert cards, chips. React uses
the key to tell list items apart when the list changes.

### JavaScript / data

**Q: Explain `generateAlerts`.**
`filter` keeps the courses under 80%, `map` turns each into an alert object with a
written message, and `sort` puts Critical before Warning using a numeric priority, with
lower attendance breaking ties.

**Q: How do you calculate how many classes can be missed?**
Missing a class raises the total but not the attended count, so the largest total I can
reach is `attended × 100 ÷ 75`. Subtract the current total, and clamp to zero.

**Q: How do you calculate the recovery number?**
Attending raises both counters, so I solve `(attended + n) / (total + n) ≥ 0.75` for
`n`, which gives `(75 × total − 100 × attended) / 25`, rounded up. For AI it gives 5,
and 18/24 is exactly 75%.

**Q: Why `reduce` for overall attendance instead of averaging the percentages?**
Because the courses have different numbers of classes. I add all attended and all total
classes first, then take one percentage, so a 22-class course counts more than a
19-class one.

**Q: What happens if a course has zero total classes?**
`calculateAttendance` returns 0 instead of `NaN`. Without that guard the charts would
break.

### Charts

**Q: Which two chart types did you use and why those?**
A bar chart, because comparing five courses side by side is exactly what bars are for.
A pie chart, because Safe/Warning/Critical are parts of one whole — five courses.

**Q: How do the charts stay up to date?**
They are not stored. The chart data objects are rebuilt from `courses` on every render,
so changing attendance redraws them automatically.

### Email

**Q: Does your app actually send an email?**
It prepares it. It builds a `mailto:` link and opens the phone's mail app with the
recipient, subject and body already filled in, and the student presses send.

**Q: Why not use an email API?**
The API key would be inside the app that users install and could be extracted. Automatic
sending needs a backend that keeps the key on the server.

### Design / AI

**Q: Defend one design decision.**
Not storing the attendance percentage. Storing it would mean updating it everywhere
attendance changes, and one missed update would show a wrong number. Calculating it on
demand makes that bug impossible, and five courses is far too small for performance to
matter.

**Q: How did AI help, and what did you reject?**
It drafted components and styling and explained the chart library. I rejected its
suggestion to use React Navigation because the assignment penalises it, and its
suggestion to put an email API key in the app for security reasons. I derived and
hand-checked the attendance formulas myself against the boundary cases.

---

# Live Modification Cheat Sheet

The instructor will ask for a small change. Here is where each one is.

| Request | File | Change |
|---|---|---|
| **Minimum attendance 75 → 80** | `src/utils/attendance.js` | `MIN_ATTENDANCE = 80` — percentages, statuses, alerts, advice and the progress-bar marker all follow |
| **Change the Safe threshold** | `src/utils/attendance.js` | `SAFE_ATTENDANCE = 85` |
| **Add a new course** | `src/data/courses.js` | Add an object with a new `id`. Everything else is automatic |
| **Add a field to a course** | `src/data/courses.js` + `CourseDetails.js` | Add the field, then one more `<DetailRow label="..." value={course.yourField} />` |
| **Show only critical courses** | `src/views/Courses.js` | Change the filter default to `"Critical"`, or in `App.js` `useState("Critical")` for `filter` |
| **Change the default sort** | `App.js` | `useState("highest")` instead of `"lowest"` |
| **Reverse the alert order** | `src/utils/attendance.js` | In the `sort`, swap to `b.priority - a.priority` |
| **Sort alerts by course name** | `src/utils/attendance.js` | `.sort((a, b) => a.courseName.localeCompare(b.courseName))` |
| **Handle an empty course list** | Already handled | Set `useState([])` in `App.js` to demonstrate the empty states |
| **Change an attendance value** | `src/data/courses.js` | Edit `attendedClasses`; the charts, status, alerts and dashboard all change |
| **Change the email threshold options** | `src/views/EmailSettings.js` | Edit `THRESHOLD_OPTIONS` |
| **Change the default email threshold** | `App.js` | `threshold:` in `initialEmailSettings` |
| **Add a fourth status** | `src/utils/attendance.js` + `src/theme.js` | Add the case in `getAttendanceStatus` and the colour pair in `getStatusColors` |
| **Add a new view** | `src/components/ViewSwitcher.js` + `App.js` | One entry in `VIEWS`, one `if` in `renderCurrentView()` |
| **Change the search to code only** | `src/views/Courses.js` | Delete the `course.name.toLowerCase().includes(...)` half of the condition |
| **Change a chart colour** | `src/theme.js` | Edit `colors.safe` / `warning` / `critical` — badges, bars, slices and progress bars all change together |

**The point to make if asked why it is this easy:** the thresholds are constants in one
file, the data is in one file, and everything displayed is calculated from them rather
than typed in.
