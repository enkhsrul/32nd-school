import React, { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarCheck,
  Clock,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentDashboard() {
  const { profile } = useAuth();

  const [stats, setStats] = useState({
    grades: [],
    attendance: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile || !supabase) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const { data: att, error: attendanceError } = await supabase
          .from("attendance")
          .select("status")
          .eq("student_id", profile.id);

        if (attendanceError) throw attendanceError;

        const present =
          att?.filter((x) => x.status === "PRESENT").length || 0;

        const total = att?.length || 0;

        const { data: grades, error: gradesError } = await supabase
          .from("grades")
          .select("score, period, subjects(name)")
          .eq("student_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (gradesError) throw gradesError;

        setStats({
          grades: grades || [],
          attendance: total
            ? ((present / total) * 100).toFixed(1)
            : 0,
          total,
        });
      } catch (err) {
        console.error(err);
        setError("Мэдээлэл ачаалахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [profile]);

  const getGradeStatus = (score) => {
    if (score >= 90) return "Онц";
    if (score >= 80) return "Сайн";
    if (score >= 70) return "Дунд";
    return "Анхаарах";
  };

  return (
    <div className="student-dashboard">

      <div className="page-head student-welcome">
        <div>
          <p className="dashboard-label">Сурагчийн портал</p>

          <h1>
            Сайн уу, {profile?.first_name || "Сурагч"}! 👋
          </h1>

          <p className="muted">
            Өнөөдрийн сургалтын мэдээллээ эндээс хараарай.
          </p>
        </div>

        <div className="student-profile-badge">
          <div className="student-avatar">
            {profile?.first_name?.charAt(0) || "С"}
          </div>

          <div>
            <strong>
              {profile?.last_name} {profile?.first_name}
            </strong>

            <span>Сурагч</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Мэдээлэл ачаалж байна...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">

            <div className="stat-card student-stat">
              <div className="stat-icon">
                <CalendarCheck size={22} />
              </div>

              <div>
                <span>Ирц</span>
                <strong>{stats.attendance}%</strong>
                <small>
                  {stats.attendance >= 90
                    ? "Сайн байна!"
                    : "Ирцээ анхаараарай"}
                </small>
              </div>
            </div>

            <div className="stat-card student-stat">
              <div className="stat-icon">
                <BookOpen size={22} />
              </div>

              <div>
                <span>Сүүлийн дүн</span>
                <strong>{stats.grades.length}</strong>
                <small>Сүүлийн 5 бүртгэл</small>
              </div>
            </div>

            <div className="stat-card student-stat">
              <div className="stat-icon">
                <Award size={22} />
              </div>

              <div>
                <span>Ирцийн бүртгэл</span>
                <strong>{stats.total}</strong>
                <small>Нийт бүртгэгдсэн</small>
              </div>
            </div>

          </div>

          <div className="student-content-grid">

            <section className="card student-card">

              <div className="section-heading">
                <div>
                  <h2>Сүүлийн дүн</h2>
                  <p className="muted">
                    Таны хамгийн сүүлд бүртгэгдсэн дүнгүүд
                  </p>
                </div>

                <div className="section-icon">
                  <TrendingUp size={20} />
                </div>
              </div>

              {stats.grades.length ? (
                <div className="grades-list">

                  {stats.grades.map((g, i) => (
                    <div className="grade-row" key={i}>

                      <div className="grade-subject">
                        <div className="subject-icon">
                          <BookOpen size={17} />
                        </div>

                        <div>
                          <strong>
                            {g.subjects?.name || "Хичээл"}
                          </strong>

                          <span>
                            {g.period || "Үнэлгээ"}
                          </span>
                        </div>
                      </div>

                      <div className="grade-result">
                        <strong>{g.score}</strong>

                        <span
                          className={
                            g.score >= 90
                              ? "grade-excellent"
                              : g.score >= 80
                              ? "grade-good"
                              : "grade-normal"
                          }
                        >
                          {getGradeStatus(g.score)}
                        </span>
                      </div>

                    </div>
                  ))}

                </div>
              ) : (
                <div className="empty-state">

                  <div className="empty-icon">
                    <BookOpen size={25} />
                  </div>

                  <strong>Одоогоор дүн байхгүй</strong>

                  <p className="muted">
                    Багш дүн оруулсны дараа энд харагдана.
                  </p>

                </div>
              )}

            </section>

            <section className="card attendance-card">

              <div className="section-heading">
                <div>
                  <h2>Таны ирц</h2>
                  <p className="muted">
                    Нийт бүртгэл дээр үндэслэв
                  </p>
                </div>

                <div className="section-icon">
                  <CalendarCheck size={20} />
                </div>
              </div>

              <div className="attendance-circle">
                <strong>{stats.attendance}%</strong>
                <span>Ирц</span>
              </div>

              <div className="attendance-info">

                <div>
                  <Clock size={17} />
                  <span>Нийт бүртгэл</span>
                  <strong>{stats.total}</strong>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Ирсэн</span>
                  <strong>
                    {Math.round(
                      (Number(stats.attendance) / 100) *
                        stats.total
                    )}
                  </strong>
                </div>

              </div>

            </section>

          </div>
        </>
      )}

    </div>
  );
}