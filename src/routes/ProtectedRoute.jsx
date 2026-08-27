import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { profile, loading } = useAuth();

  if (loading) return <div className="center-screen">Ачаалж байна...</div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(profile.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}