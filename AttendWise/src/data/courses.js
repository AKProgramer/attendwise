// Sample data for the application.
//
// NOTE: there is deliberately no "percentage" or "status" field here.
// Those values are always CALCULATED from attendedClasses / totalClasses,
// so they can never go out of sync with the real numbers.

export const initialCourses = [
  {
    id: 1,
    code: "CS401",
    name: "Software for Mobile Devices",
    instructor: "Dr. Ali Raza",
    instructorEmail: "ali.raza@university.edu",
    totalClasses: 20,
    attendedClasses: 17, // 85% -> Safe
  },
  {
    id: 2,
    code: "CS405",
    name: "Software Engineering",
    instructor: "Dr. Sana Iqbal",
    instructorEmail: "sana.iqbal@university.edu",
    totalClasses: 22,
    attendedClasses: 20, // 91% -> Safe
  },
  {
    id: 3,
    code: "CS302",
    name: "Database Systems",
    instructor: "Mr. Usman Tariq",
    instructorEmail: "usman.tariq@university.edu",
    totalClasses: 22,
    attendedClasses: 17, // 77% -> Warning
  },
  {
    id: 4,
    code: "CS410",
    name: "Computer Networks",
    instructor: "Ms. Hira Shah",
    instructorEmail: "hira.shah@university.edu",
    totalClasses: 19,
    attendedClasses: 15, // 79% -> Warning
  },
  {
    id: 5,
    code: "CS408",
    name: "Artificial Intelligence",
    instructor: "Dr. Bilal Ahmed",
    instructorEmail: "bilal.ahmed@university.edu",
    totalClasses: 19,
    attendedClasses: 13, // 68% -> Critical
  },
];
