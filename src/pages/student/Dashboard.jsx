import React, { useEffect, useState } from "react";
import { Award, BookOpen, CalendarCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ grades: [], attendance: 0, total: 0 });

  useEffect(() => {
    if (!profile || !supabase) return;
    (async () => {
      const { data: att } = await supabase.from("attendance").select("status").eq("student_id", profile.id);
      const present = att?.filter(x => x.status === "PRESENT").length || 0;
      const total = att?.length || 0;
      const { data: grades } = await supabase
        .from("grades").select("score, period, subjects(name)")
        .eq("student_id", profile.id).order("created_at", { ascending: false }).limit(5);
      setStats({ grades: grades || [], attendance: total ? ((present / total) * 100).toFixed(1) : 0, total });
    })();
  }, [profile]);

  return (
    <>
      <div className="page-head">
        <div><h1>Сайн уу, {profile?.first_name}!</h1><p className="muted">Таны сургалтын мэдээлэл</p></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><CalendarCheck/><div><span>Ирц</span><strong>{stats.attendance}%</strong></div></div>
        <div className="stat-card"><BookOpen/><div><span>Сүүлийн дүн</span><strong>{stats.grades.length}</strong></div></div>
        <div className="stat-card"><Award/><div><span>Ирцийн бүртгэл</span><strong>{stats.total}</strong></div></div>
      </div>
      <section className="card">
        <h2>Сүүлийн дүн</h2>
        {stats.grades.length ? stats.grades.map((g, i) => (
          <div className="list-row" key={i}><span>{g.subjects?.name || "Хичээл"}</span><strong>{g.score}</strong></div>
        )) : <p className="muted">Одоогоор дүн оруулаагүй байна.</p>}
      </section>
    </>
  );
}