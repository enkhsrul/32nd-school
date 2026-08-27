import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/Dashboard";
import StudentGrades from "./pages/student/Grades";
import Assignments from "./pages/student/Assignments";
import Attendance from "./pages/teacher/Attendance";
import TeacherGrades from "./pages/teacher/Grades";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Classes from "./pages/admin/Classes";
import Chat from "./pages/common/Chat";

function HomeRedirect() {
  const { profile, loading } = useAuth();
  if (loading) return <div className="center-screen">Ачаалж байна...</div>;
  if (!profile) return <Navigate to="/login" replace />;
  return <Navigate to={profile.role === "ADMIN" ? "/admin" : profile.role === "TEACHER" ? "/teacher" : "/student"} replace />;
}

function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/" element={<HomeRedirect/>}/>

    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]}/>}><Route element={<Layout/>}>
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="/admin/users" element={<Users/>}/>
      <Route path="/admin/classes" element={<Classes/>}/>
    </Route></Route>

    <Route element={<ProtectedRoute allowedRoles={["TEACHER"]}/>}><Route element={<Layout/>}>
      <Route path="/teacher" element={<Attendance/>}/>
      <Route path="/teacher/attendance" element={<Attendance/>}/>
      <Route path="/teacher/grades" element={<TeacherGrades/>}/>
      <Route path="/chat" element={<Chat/>}/>
    </Route></Route>

    <Route element={<ProtectedRoute allowedRoles={["STUDENT"]}/>}><Route element={<Layout/>}>
      <Route path="/student" element={<StudentDashboard/>}/>
      <Route path="/student/grades" element={<StudentGrades/>}/>
      <Route path="/student/assignments" element={<Assignments/>}/>
      <Route path="/chat" element={<Chat/>}/>
    </Route></Route>

    <Route path="/unauthorized" element={<div className="center-screen"><h1>403</h1><p>Таны эрх хүрэхгүй байна.</p></div>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}

export default function App(){ return <AuthProvider><AppRoutes/></AuthProvider>; }