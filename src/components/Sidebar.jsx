import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Users, BookOpen, ClipboardList, MessageCircle,
  LogOut, GraduationCap, BarChart3
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const menus = {
  ADMIN: [
    ["/admin", "Хянах самбар", Home],
    ["/admin/users", "Хэрэглэгчид", Users],
    ["/admin/classes", "Ангиуд", GraduationCap]
  ],
  TEACHER: [
    ["/teacher", "Нүүр", Home],
    ["/teacher/attendance", "Ирц бүртгэл", ClipboardList],
    ["/teacher/grades", "Дүн оруулах", BookOpen],
    ["/chat", "Мессеж", MessageCircle]
  ],
  STUDENT: [
    ["/student", "Миний нүүр", Home],
    ["/student/grades", "Миний дүн", BookOpen],
    ["/student/assignments", "Даалгавар", ClipboardList],
    ["/chat", "Мессеж", MessageCircle]
  ]
};

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const items = menus[profile?.role] || [];

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <GraduationCap size={25} />
        <div>
          <strong>32-р Сургууль</strong>
          <small>{profile?.role === "ADMIN" ? "Админ" : profile?.role === "TEACHER" ? "Багш" : "Сурагч"}</small>
        </div>
      </div>

      <nav className="nav">
        {items.map(([path, label, Icon]) => (
          <NavLink key={path} to={path} end={path === "/admin" || path === "/teacher" || path === "/student"}>
            {({ isActive }) => (
              <span className={isActive ? "nav-item active" : "nav-item"}>
                <Icon size={19} />
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button className="logout" onClick={doLogout}>
        <LogOut size={18} /> Гарах
      </button>
    </aside>
  );
}