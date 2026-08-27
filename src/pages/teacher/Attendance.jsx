import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Attendance() {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("profile_id, student_id_code, profiles(first_name,last_name), classes(name,teacher_id)")
      .eq("classes.teacher_id", profile.id);
    if (error) setMessage(error.message);
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile]);

  const mark = async (studentId, status) => {
    setMessage("");
    const { error } = await supabase.from("attendance").upsert({
      student_id: studentId,
      status,
      teacher_id: profile.id,
      date: new Date().toISOString().slice(0, 10)
    }, { onConflict: "student_id,date" });
    setMessage(error ? error.message : "Ирц амжилттай бүртгэгдлээ.");
  };

  return (
    <>
      <div className="page-head"><div><h1>Өнөөдрийн ирц</h1><p className="muted">{new Date().toLocaleDateString("mn-MN")}</p></div></div>
      {message && <div className="notice">{message}</div>}
      <section className="card">
        {loading ? <p>Ачаалж байна...</p> : students.length === 0 ? <p className="muted">Танд хуваарилагдсан сурагч олдсонгүй.</p> :
        <div className="table-wrap"><table><thead><tr><th>Код</th><th>Овог нэр</th><th>Ирц</th></tr></thead>
        <tbody>{students.map(s => (
          <tr key={s.profile_id}>
            <td>{s.student_id_code}</td>
            <td>{s.profiles?.last_name} {s.profiles?.first_name}</td>
            <td className="actions">
              <button className="icon-btn success" onClick={() => mark(s.profile_id, "PRESENT")}><Check size={17}/> Ирсэн</button>
              <button className="icon-btn danger" onClick={() => mark(s.profile_id, "ABSENT")}><X size={17}/> Тасалсан</button>
            </td>
          </tr>
        ))}</tbody></table></div>}
      </section>
    </>
  );
}