import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";

// Auth
import Login from "./pages/auth/Login";

// Student
import StudentDashboard from "./pages/student/Dashboard";
import StudentGrades from "./pages/student/Grades";
import Assignments from "./pages/student/Assignments";
import Notifications from "./pages/student/Notifications";

// Teacher
import Attendance from "./pages/teacher/Attendance";
import TeacherGrades from "./pages/teacher/Grades";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Classes from "./pages/admin/Classes";

// Common
import Chat from "./pages/common/Chat";

function HomeRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        Ачаалж байна...
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (profile.role === "TEACHER") {
    return <Navigate to="/teacher" replace />;
  }

  return <Navigate to="/student" replace />;
}

function AppRoutes() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* HOME REDIRECT */}
      <Route
        path="/"
        element={<HomeRedirect />}
      />

      {/* ================= ADMIN ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} />
        }
      >
        <Route element={<Layout />}>

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<Users />}
          />

          <Route
            path="/admin/classes"
            element={<Classes />}
          />

        </Route>
      </Route>

      {/* ================= TEACHER ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]} />
        }
      >
        <Route element={<Layout />}>

          <Route
            path="/teacher"
            element={<Attendance />}
          />

          <Route
            path="/teacher/attendance"
            element={<Attendance />}
          />

          <Route
            path="/teacher/grades"
            element={<TeacherGrades />}
          />

          <Route
            path="/chat"
            element={<Chat />}
          />

        </Route>
      </Route>

      {/* ================= STUDENT ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]} />
        }
      >
        <Route element={<Layout />}>

          <Route
            path="/student"
            element={<StudentDashboard />}
          />

          <Route
            path="/student/grades"
            element={<StudentGrades />}
          />

          <Route
            path="/student/assignments"
            element={<Assignments />}
          />

          <Route
            path="/student/notifications"
            element={<Notifications />}
          />

          <Route
            path="/chat"
            element={<Chat />}
          />

        </Route>
      </Route>

      {/* UNAUTHORIZED */}
      <Route
        path="/unauthorized"
        element={
          <div className="center-screen">
            <h1>403</h1>
            <p>Таны эрх хүрэхгүй байна.</p>
          </div>
        }
      />

      {/* UNKNOWN ROUTE */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
