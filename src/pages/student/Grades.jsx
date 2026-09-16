import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentGrades() {
  const { profile } = useAuth();

  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // LOAD GRADES
  // =========================

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    async function loadGrades() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("grades")
        .select(`
          id,
          score,
          type,
          period,
          created_at,
          subjects (
            name
          )
        `)
        .eq("student_id", profile.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Grades error:", error);
        setError("Дүн ачаалахад алдаа гарлаа.");
        setGrades([]);
      } else {
        setGrades(data || []);
      }

      setLoading(false);
    }

    loadGrades();
  }, [profile]);

  // =========================
  // CREATE SUBJECT LIST
  // =========================

  const subjects = useMemo(() => {
    const subjectMap = new Map();

    grades.forEach((grade) => {
      const subjectName = grade.subjects?.name;

      if (!subjectName) return;

      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          name: subjectName,
          count: 0,
          scores: [],
        });
      }

      const subject = subjectMap.get(subjectName);

      subject.count += 1;

      if (
        grade.score !== null &&
        grade.score !== undefined &&
        grade.score !== "" &&
        !isNaN(Number(grade.score))
      ) {
        subject.scores.push(Number(grade.score));
      }
    });

    return Array.from(subjectMap.values()).map(
      (subject) => {
        let average = "-";

        if (subject.scores.length > 0) {
          const total = subject.scores.reduce(
            (sum, score) => sum + score,
            0
          );

          average = (
            total / subject.scores.length
          ).toFixed(1);
        }

        return {
          name: subject.name,
          count: subject.count,
          average,
        };
      }
    );
  }, [grades]);

  // =========================
  // SEARCH SUBJECTS
  // =========================

  const filteredSubjects = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    if (!searchText) {
      return subjects;
    }

    return subjects.filter((subject) =>
      subject.name
        .toLowerCase()
        .includes(searchText)
    );
  }, [subjects, search]);

  // =========================
  // SELECTED SUBJECT GRADES
  // =========================

  const selectedGrades = useMemo(() => {
    if (!selectedSubject) {
      return [];
    }

    return grades.filter(
      (grade) =>
        grade.subjects?.name === selectedSubject
    );
  }, [grades, selectedSubject]);

  // =========================
  // SELECTED SUBJECT AVERAGE
  // =========================

  const selectedAverage = useMemo(() => {
    const scores = selectedGrades
      .map((grade) => Number(grade.score))
      .filter((score) => !isNaN(score));

    if (scores.length === 0) {
      return "-";
    }

    const total = scores.reduce(
      (sum, score) => sum + score,
      0
    );

    return (total / scores.length).toFixed(1);
  }, [selectedGrades]);

  // =========================
  // TOTAL SUBJECTS
  // =========================

  const totalSubjects = subjects.length;

  // =========================
  // TOTAL GRADES
  // =========================

  const totalGrades = grades.length;

  // =========================
  // OVERALL AVERAGE
  // =========================

  const overallAverage = useMemo(() => {
    const scores = grades
      .map((grade) => Number(grade.score))
      .filter((score) => !isNaN(score));

    if (scores.length === 0) {
      return "-";
    }

    const total = scores.reduce(
      (sum, score) => sum + score,
      0
    );

    return (total / scores.length).toFixed(1);
  }, [grades]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1>Миний дүн</h1>
            <p className="muted">
              Дүнгүүдийг ачаалж байна...
            </p>
          </div>
        </div>

        <section className="card">
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <p className="muted">
              Дүнгүүдийг ачаалж байна...
            </p>
          </div>
        </section>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1>Миний дүн</h1>
            <p className="muted">
              Алдаа гарлаа
            </p>
          </div>
        </div>

        <section className="card">
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <h3
              style={{
                color: "#dc2626",
                marginBottom: "10px",
              }}
            >
              Дүн ачаалахад алдаа гарлаа
            </h3>

            <p className="muted">
              {error}
            </p>
          </div>
        </section>
      </div>
    );
  }

  // =========================
  // SELECTED SUBJECT PAGE
  // =========================

  if (selectedSubject) {
    return (
      <div>
        <div className="page-head">
          <div>
            <button
              onClick={() =>
                setSelectedSubject(null)
              }
              style={{
                border: "none",
                background: "#f1f5f9",
                color: "#334155",
                padding: "9px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "14px",
              }}
            >
              ← Буцах
            </button>

            <h1>{selectedSubject}</h1>

            <p className="muted">
              Энэ хичээлийн бүх бүртгэгдсэн дүн
            </p>
          </div>
        </div>

        {/* SUBJECT STATS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div className="stat-card">
            <span className="muted">
              Нийт дүн
            </span>

            <strong
              style={{
                display: "block",
                fontSize: "28px",
                marginTop: "6px",
              }}
            >
              {selectedGrades.length}
            </strong>
          </div>

          <div className="stat-card">
            <span className="muted">
              Дундаж оноо
            </span>

            <strong
              style={{
                display: "block",
                fontSize: "28px",
                marginTop: "6px",
              }}
            >
              {selectedAverage}
            </strong>
          </div>
        </div>

        {/* ALL GRADES */}

        <section className="card">
          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Дүнгийн жагсаалт
            </h2>

            <p
              className="muted"
              style={{
                marginTop: "5px",
                fontSize: "13px",
              }}
            >
              Энэ хичээлийн бүх дүн
            </p>
          </div>

          {selectedGrades.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Төрөл</th>
                    <th>Улирал</th>
                    <th>Оноо</th>
                    <th>Огноо</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedGrades.map(
                    (grade) => (
                      <tr key={grade.id}>
                        <td>
                          {grade.type || "-"}
                        </td>

                        <td>
                          {grade.period || "-"}
                        </td>

                        <td>
                          <strong
                            style={{
                              fontSize: "17px",
                            }}
                          >
                            {grade.score ?? "-"}
                          </strong>
                        </td>

                        <td>
                          {grade.created_at
                            ? new Date(
                                grade.created_at
                              ).toLocaleDateString(
                                "mn-MN"
                              )
                            : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <h3>
                Дүн байхгүй
              </h3>

              <p className="muted">
                Энэ хичээлд одоогоор дүн
                бүртгэгдээгүй байна.
              </p>
            </div>
          )}
        </section>
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div>
      {/* HEADER */}

      <div className="page-head">
        <div>
          <h1>Миний дүн</h1>

          <p className="muted">
            Бүх хичээлийн дүнгээ эндээс хараарай
          </p>
        </div>
      </div>

      {/* STATISTICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div className="stat-card">
          <span className="muted">
            Нийт хичээл
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "28px",
              marginTop: "6px",
            }}
          >
            {totalSubjects}
          </strong>
        </div>

        <div className="stat-card">
          <span className="muted">
            Нийт дүн
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "28px",
              marginTop: "6px",
            }}
          >
            {totalGrades}
          </strong>
        </div>

        <div className="stat-card">
          <span className="muted">
            Ерөнхий дундаж
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "28px",
              marginTop: "6px",
            }}
          >
            {overallAverage}
          </strong>
        </div>
      </div>

      {/* SUBJECT LIST */}

      <section className="card">
        {/* SEARCH */}

        <div
          style={{
            marginBottom: "22px",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="🔎  Хичээл хайх..."
            style={{
              width: "100%",
              padding: "13px 16px",
              border:
                "1px solid #d7dce5",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* TITLE */}

        <div
          style={{
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            Бүх хичээл
          </h2>

          <p
            className="muted"
            style={{
              marginTop: "5px",
              fontSize: "13px",
            }}
          >
            {search
              ? `${filteredSubjects.length} хичээл олдлоо`
              : `${subjects.length} хичээл`}
          </p>
        </div>

        {/* SUBJECTS */}

        {filteredSubjects.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {filteredSubjects.map(
              (subject) => (
                <button
                  key={subject.name}
                  onClick={() =>
                    setSelectedSubject(
                      subject.name
                    )
                  }
                  style={{
                    width: "100%",
                    border:
                      "1px solid #e2e8f0",
                    background: "#ffffff",
                    borderRadius: "10px",
                    padding:
                      "15px 18px",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    transition:
                      "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "#f8fafc";

                    e.currentTarget.style.borderColor =
                      "#bfdbfe";

                    e.currentTarget.style.transform =
                      "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "#ffffff";

                    e.currentTarget.style.borderColor =
                      "#e2e8f0";

                    e.currentTarget.style.transform =
                      "translateX(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "14px",
                      minWidth: 0,
                    }}
                  >
                    {/* ICON */}

                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        minWidth: "42px",
                        borderRadius:
                          "10px",
                        background:
                          "#eff6ff",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "19px",
                      }}
                    >
                      📚
                    </div>

                    {/* SUBJECT NAME */}

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "15px",
                          fontWeight:
                            "600",
                          color:
                            "#172033",
                          marginBottom:
                            "4px",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {subject.name}
                      </div>

                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#64748b",
                        }}
                      >
                        {subject.count}{" "}
                        дүн
                        {" • "}
                        Дундаж{" "}
                        {subject.average}
                      </div>
                    </div>
                  </div>

                  {/* ARROW */}

                  <div
                    style={{
                      color:
                        "#94a3b8",
                      fontSize:
                        "21px",
                      marginLeft:
                        "10px",
                    }}
                  >
                    →
                  </div>
                </button>
              )
            )}
          </div>
        ) : (
          /* EMPTY */

          <div
            style={{
              textAlign: "center",
              padding:
                "50px 20px",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom:
                  "12px",
              }}
            >
              🔎
            </div>

            <h3>
              {search
                ? "Хичээл олдсонгүй"
                : "Хичээл байхгүй"}
            </h3>

            <p className="muted">
              {search
                ? `"${search}" гэсэн нэртэй хичээл олдсонгүй.`
                : "Танд одоогоор хичээлийн дүн бүртгэгдээгүй байна."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}