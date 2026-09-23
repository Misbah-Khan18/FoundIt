import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ReportsProvider } from "./context/ReportsContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { AnimationProvider } from "./context/AnimationContext.jsx";

import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Public pages
import Home from "./pages/Home.jsx";
import LostItems from "./pages/LostItems.jsx";
import FoundItems from "./pages/FoundItems.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import NotFound from "./pages/NotFound.jsx";

// Protected student portal pages
import Dashboard from "./pages/Dashboard.jsx";
import ReportLost from "./pages/ReportLost.jsx";
import ReportFound from "./pages/ReportFound.jsx";
import MyReports from "./pages/MyReports.jsx";
import MyClaims from "./pages/MyClaims.jsx";
import Notifications from "./pages/Notifications.jsx";

// Protected admin workspace pages
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import ManageReports from "./pages/ManageReports.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import AdminPendingApprovals from "./pages/admin/AdminPendingApprovals.jsx";
import AdminClaims from "./pages/admin/AdminClaims.jsx";
import AdminMatches from "./pages/admin/AdminMatches.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ReportsProvider>
        <AdminProvider>
          <AnimationProvider>
            <BrowserRouter>
              <Routes>
                {/* Public site layout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/lost-items" element={<LostItems />} />
                  <Route path="/found-items" element={<FoundItems />} />
                  <Route path="/about" element={<Navigate to="/#about" replace />} />
                  <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
                  <Route path="/items/:id" element={<ItemDetails />} />
                </Route>

                {/* Auth pages (login, register, forgot-password, reset-password) */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Student/User Workspace (Protected) */}
                <Route element={<ProtectedRoute />}>
                  {/* Dashboard Sidebar Navigation Layout */}
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/reports" element={<MyReports />} />
                    <Route path="/dashboard/claims" element={<MyClaims />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>

                  {/* Public-styled layouts that require login to submit reports */}
                  <Route element={<MainLayout />}>
                    <Route path="/report-lost" element={<ReportLost />} />
                    <Route path="/report-found" element={<ReportFound />} />
                  </Route>
                </Route>

                {/* Administrator Console (Protected) */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/admin" element={<AdminOverview />} />
                    <Route path="/admin/reports" element={<ManageReports />} />
                    <Route path="/admin/users" element={<ManageUsers />} />
                    <Route path="/admin/pending" element={<AdminPendingApprovals />} />
                    <Route path="/admin/claims" element={<AdminClaims />} />
                    <Route path="/admin/matches" element={<AdminMatches />} />
                  </Route>
                </Route>

                {/* Fallback aliases to prevent 404s on direct/legacy report links */}
                <Route path="/my-reports" element={<Navigate to="/dashboard/reports" replace />} />
                <Route path="/my-claims" element={<Navigate to="/dashboard/claims" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AnimationProvider>
        </AdminProvider>
      </ReportsProvider>
    </AuthProvider>
  );
}
