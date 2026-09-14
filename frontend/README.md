<div align="center">

# 🎨 FoundIt — Frontend Client

### *Modern, responsive React client built for high-speed campus lost & found workflows.*

<br/>

[![React](https://img.shields.io/badge/React-19.x-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=flat-square&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Lucide React](https://img.shields.io/badge/Lucide_Icons-Latest-F56565?style=flat-square&logo=feather&logoColor=white)](https://lucide.dev/)

</div>

<br/>

## 🌟 Overview

The **FoundIt** frontend client is designed for smooth, high-fidelity interaction. Built with **React 19**, **Tailwind CSS v4**, and **Vite**, it delivers instantaneous route transitions, glassmorphic UI cards, live report count-up animations, and intuitive claim management.

---

## 🧭 Page & Route Architecture

| Route | Page Component | Layout | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `Home.jsx` | `MainLayout` | Landing page, dynamic live campus stats & quick actions |
| `/lost-items` | `LostItems.jsx` | `MainLayout` | Filterable lost items feed with location & category badges |
| `/found-items` | `FoundItems.jsx` | `MainLayout` | Discoverable found items gallery with claim triggers |
| `/items/:id` | `ItemDetails.jsx` | `MainLayout` | Detailed item page with status & claim initiation |
| `/report-lost` | `ReportLost.jsx` | `MainLayout` | Form for reporting lost personal belongings |
| `/report-found` | `ReportFound.jsx` | `MainLayout` | Form for logging found items with location tags |
| `/login` | `Login.jsx` | `AuthLayout` | Secure authentication card |
| `/register` | `Register.jsx` | `AuthLayout` | Student / User account registration |
| `/dashboard` | `Dashboard.jsx` | `DashboardLayout` | User portal with stats, quick links & recent activity |
| `/my-reports` | `MyReports.jsx` | `DashboardLayout` | User's active & past reported items |
| `/my-claims` | `MyClaims.jsx` | `DashboardLayout` | Claim tracking & verification status |
| `/notifications`| `Notifications.jsx`| `DashboardLayout` | System match alerts & claim updates |
| `/admin` | `AdminDashboard.jsx`| `DashboardLayout` | Security & Admin control center |
| `/admin/users` | `ManageUsers.jsx` | `DashboardLayout` | User directory and account suspension |
| `/admin/reports`| `ManageReports.jsx`| `DashboardLayout` | Listing dispute & moderation manager |

---

## ⚡ Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local development server at `http://localhost:5173` |
| `npm run build` | Compiles optimized production bundle in `/dist` |
| `npm run preview` | Spins up a local preview server for the production build |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues |

---

## 🎨 Design System & Aesthetics

- **Color Tokens**: Emerald green (`#10b981`), Cyber Cyan (`#06b6d4`), Indigo glow, and Slate neutrals.
- **Glassmorphism**: Translucent backdrop blur effects (`backdrop-blur-md`) with subtle border highlights.
- **Animations**: Dynamic number counters via `useCountUp`, floating mesh gradients, and hover card elevations.
- **Accessibility**: Semantic HTML tags, aria live regions for live counters, and high contrast status indicators.

<br/>

<div align="center">
  <sub>Part of the <a href="../README.md">FoundIt Ecosystem</a></sub>
</div>
