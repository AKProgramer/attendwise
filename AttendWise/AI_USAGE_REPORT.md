# AI Usage Report

**Project:** AttendWise — Attendance Monitoring & Academic Alert System
**Course:** Software for Mobile Devices — Assignment 1
**Student Name:** 
**Roll Number:** _[your roll number]_
**Date:** _[submission date]_

> **Note:** If the course provides an official AI Usage Report template, transfer the
> content below into that format. The sections here cover the usual fields.

---

## 1. Declaration

AI assistance was used in the development of this project, as permitted and encouraged
by the assignment policy. I am declaring that use openly here.

**AI tool used:** Claude (Anthropic), via the Claude Code assistant.

**Extent of use:** The majority of the source code was drafted by the AI tool working
from a detailed specification that I wrote. I directed the architecture and the feature
set, reviewed and tested the output, and required changes where I disagreed with it. I
understand the code I am submitting and can explain and modify any part of it.

I have not copied work from another student or from an existing project.

---

## 2. What I Specified and Decided

Before any code was written, I produced a written specification covering the problem,
the feature set, the architecture and the constraints. The following decisions were mine
and were given to the AI as requirements, not suggestions:

| Decision | My reasoning |
|---|---|
| **The problem to solve** | Students only find out they are below 75% when it is too late. The portal shows raw counts and answers no useful question. |
| **No navigation library** | The assignment penalises unnecessary navigation code. I required view switching through a single `currentView` state variable instead. |
| **No bottom or side bar** | Explicitly prohibited by the brief. I required a top button row. |
| **JavaScript, not TypeScript** | Required by the assignment. |
| **The feature set** | Attendance calculations, risk classification, the What-If simulator, prioritised alerts and email alerts. I deliberately excluded features that would only add screens. |
| **Email must not contain an API key** | A mobile app is installed on the user's device, so any key inside it can be extracted. I required either a `mailto:` approach or a documented backend design. |
| **Thresholds as named constants** | So a live viva change ("make it 80%") is one edit rather than a search across the project. |
| **Folder structure** | `components/`, `views/`, `data/`, `utils/` — separating display from calculation. |
| **Step-by-step build order** | I required the project to be built and explained in stages rather than delivered in one block, so I could follow each part. |

I also rejected a feature during development: I considered adding **login/logout** and
decided against it. With no backend there are no real accounts, so a login screen would
be a static fake gate — exactly the "static screen replication" the brief warns against,
and it would not help a student see that a course is at 68%.

---

## 3. What AI Was Used For

| Activity | Detail |
|---|---|
| **Ideation** | Discussing which attendance features would genuinely help a student versus which would only be decoration. |
| **Code generation** | First drafts of the 11 components, the 5 views, the two utility modules and the styling. |
| **Explanation / learning** | Understanding how `react-native-chart-kit` expects its `data`, `datasets` and `accessor` props; how `SafeAreaView` behaves differently on Android; why `sort()` mutating an array matters for React state. |
| **Deriving the formulas** | Working through the algebra for "classes you can miss" and "classes needed to recover" — see section 5. |
| **Debugging / tooling** | Resolving a dependency version question and verifying the project bundles. |
| **Documentation** | Drafting `README.md` and `VIVA_GUIDE.md`. |

---

## 4. Review, Testing and Validation Performed

I did not assume the generated code was correct. The following checks were run:

**Calculation testing.** The attendance functions were extracted and run against
boundary cases before any UI was built on top of them:

| Test case | Expected | Result |
|---|---|---|
| 18/24 — exactly 75% | can miss 0, recover 0 | ✓ |
| 15/20 — exactly 75% | can miss 0 | ✓ |
| 13/19 = 68% | recover 5 → 18/24 = 75% | ✓ |
| 0/0 — a course with no classes | 0, not `NaN` | ✓ |
| Empty course array | overall 0%, 0 alerts, no crash | ✓ |
| Alert ordering | Critical first, then lowest attendance | ✓ |

**Build verification.** `npx expo export` was run to confirm the whole project bundles
(738 modules, no errors), and the development server was queried directly to confirm it
serves the bundle correctly.

**Code review.** Every file was read through for unused imports, duplicated logic and
values that should have been constants.

---

## 5. AI Output I Rejected or Corrected

This is the part I consider most important, because it shows the output was not taken at
face value.

**1. Expo Router was pushed by the tooling and removed.**
The `create-expo-app` template generated an `AGENTS.md` file instructing any AI assistant
to "use Expo Router for all navigation." That directly contradicts the assignment, which
penalises navigation code. I had the file deleted so it could not influence the build,
and the app uses state-based view switching instead.

**2. An unnecessary dependency was installed and then removed.**
`expo-linking` was installed to open the email app. On review, React Native's built-in
`Linking` module does the same job, so the package was uninstalled. The project now has
six dependencies, every one of which is used.

**3. A hardcoded calculation that would break a live viva change.**
The alerts screen contained `MIN_ATTENDANCE + 5` to describe the safe level. That is
correct today only because the constants happen to be 75 and 80 — changing
`SAFE_ATTENDANCE` to 85 would have left the message saying 80%. It was replaced with the
`SAFE_ATTENDANCE` constant itself.

**4. An incorrect figure in the planning stage.**
The initial project plan estimated overall attendance at 82%. Computing it properly with
`reduce()` gives 80% (82 attended out of 102 total). The estimate was wrong and the
documentation was corrected to the calculated value.

**5. Storing a calculated value.**
I required that the attendance percentage is never stored on the course object, only
calculated from `attendedClasses / totalClasses`. A stored percentage can disagree with
the counts if any update path forgets to refresh it; a calculated one cannot.

**6. A defect found during final review.**
The user-configurable alert threshold in the Settings screen was not actually controlling
which alerts were generated — `generateAlerts()` was filtering on the fixed
`SAFE_ATTENDANCE` constant, so changing the threshold only altered the wording of the
email. _[If you fix this before submitting, change this entry to say it was found and
corrected, and describe the fix. If you submit as-is, leave it here as a known
limitation — declaring it is better than hoping it is not noticed.]_

---

## 6. What I Learned

_[Complete this section in your own words — it should be true for you. Prompts:]_

- How React re-renders when state changes, and why state must be replaced with a new
  object or array rather than edited in place.
- The difference between data that should be stored in state and data that should be
  calculated during render — and why calculated values cannot go stale.
- Why lifting state up to `App.js` is what keeps the dashboard, charts and alerts
  consistent with each other.
- How `map`, `filter`, `sort`, `find` and `reduce` chain together to turn raw data into
  a user interface.
- Why an API key cannot safely live inside a mobile application.
- _[anything that was genuinely new to you — be specific, this reads better than a list
  of general claims]_

---

## 7. Statement of Understanding

I am able to explain the structure of this application, the purpose of each component,
where and why state and props are used, how the attendance calculations work, and how
the alerts are generated. I am able to make modifications to it during the viva,
including changing thresholds, adding courses, altering filters and sorting, and handling
different data states.

**Signature:** ____________________    **Date:** ____________
