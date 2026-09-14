// Placeholder data so every page has something real to render.
// Swap these for API calls once the backend is wired up.

export const CATEGORIES = [
  "Electronics",
  "ID Cards & Documents",
  "Bags & Backpacks",
  "Books & Stationery",
  "Accessories",
  "Keys",
  "Sports Gear",
  "Other",
];

export const CAMPUS_LOCATIONS = [
  "Main Building (Ground Floor)",
  "Academic Block (Lower Ground)",
  "Central Library",
  "Campus Canteen",
  "Main Entrance Gate",
  "Seminary Hall"
];

export const ITEMS = [
  {
    id: "L-1042",
    type: "lost",
    title: "Black Dell Laptop",
    category: "Electronics",
    location: "Main Building (Ground Floor)",
    date: "2026-08-12",
    status: "open",
    description: "13-inch Dell Latitude with a blue sticker on the lid. Lost near the computer lab.",
    reporter: "Aarav Mehta",
  },
  {
    id: "F-0398",
    type: "found",
    title: "Silver Wristwatch",
    category: "Accessories",
    location: "Academic Block (Lower Ground)",
    date: "2026-08-12",
    status: "open",
    description: "Found on a table near the entrance columns of the Academic Block, handed to the front desk.",
    reporter: "Sana Iyer",
  },
  {
    id: "L-1039",
    type: "lost",
    title: "MIT-WPU Student ID Card",
    category: "ID Cards & Documents",
    location: "Main Building (Ground Floor)",
    date: "2026-08-11",
    status: "matched",
    description: "ID card for a second-year Computer Engineering student, likely dropped near the foyer.",
    reporter: "Rohan Kulkarni",
  },
  {
    id: "F-0391",
    type: "found",
    title: "Lost Smartphone",
    category: "Electronics",
    location: "Main Entrance Gate",
    date: "2026-08-10",
    status: "resolved",
    description: "Black smartphone with a transparent cover, found near the entrance gate.",
    reporter: "Priya Nair",
  },
  {
    id: "L-1035",
    type: "lost",
    title: "Wired Earphones",
    category: "Electronics",
    location: "Academic Block (Lower Ground)",
    date: "2026-08-09",
    status: "open",
    description: "White wired earphones, left near the charging column.",
    reporter: "Devansh Rao",
  },
  {
    id: "F-0387",
    type: "found",
    title: "Set of Keys",
    category: "Keys",
    location: "Main Building (Ground Floor)",
    date: "2026-08-08",
    status: "open",
    description: "Bunch of three keys on a red keychain, found near the staircase.",
    reporter: "Neha Joshi",
  },
];

export const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Possible match found",
    body: "Your lost report L-1042 (Black Dell Laptop) matches a found item logged nearby.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Claim approved",
    body: "Your claim for F-0391 (Blue Backpack) was verified and approved by campus security.",
    time: "1 day ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Report published",
    body: "Your found item report F-0387 (Set of Keys) is now live on the portal.",
    time: "3 days ago",
    unread: false,
  },
];

export const USERS = [
  { id: "u1", name: "Vive", email: "farhan.shaikh@mitwpu.edu.in", role: "Student", status: "active", reports: 3 },
  { id: "u2", name: "Sana Iyer", email: "sana.iyer@mitwpu.edu.in", role: "Student", status: "active", reports: 1 },
  { id: "u3", name: "Rohan Kulkarni", email: "rohan.kulkarni@mitwpu.edu.in", role: "Faculty", status: "active", reports: 2 },
  { id: "u4", name: "Priya Nair", email: "priya.nair@mitwpu.edu.in", role: "Student", status: "suspended", reports: 5 },
  { id: "u5", name: "Devansh Rao", email: "devansh.rao@mitwpu.edu.in", role: "Student", status: "active", reports: 1 },
];
