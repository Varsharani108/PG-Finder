import { Routes, Route } from "react-router-dom";
import AboutPage from "./pages/AboutPage.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import PrivateRoute from "./components/auth/PrivateRoute.jsx";
import UserDashboard from "./pages/dashboard/UserDashboard.jsx";
import OwnerDashboard from "./pages/dashboard/OwnerDashboard.jsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";
import SearchPage from "./pages/SearchPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Existing landing page — untouched */}
      <Route path="/" element={<AboutPage />} />

      {/* Auth module */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Role-based dashboards */}
      <Route
        path="/user/dashboard"
        element={
          <PrivateRoute roles={["user"]}>
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/owner/dashboard"
        element={
          <PrivateRoute roles={["owner"]}>
            <OwnerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <SearchPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
