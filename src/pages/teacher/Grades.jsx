import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Grades() {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ student_id: "", subject_id: "", score: "", type: "ASSIGNMENT", period: "2026-2027" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: s }, { data: sub }] = await Promise.all([
        supabase.from("students").select("profile_id,student_id_code,profiles(first_name,last_name),classes(name,teacher_id)").eq("classes.teacher_id", profile.id),
        supabase.from("subjects").select("id,name").order("name")
      ]);
      setStudents(s || []);
      setSubjects(sub || []);
    })();
  }, [profile]);

  const save = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("grades").insert({
      student_id: form.student_id, subject_id: form.subject_id, teacher_id: profile.id,
      score: Number(form.score), type: form.type, period: form.period
    });
    setMessage(error ? error.message : "Дүн хадгалагдлаа.");
    if (!error) setForm({...form, score: ""});
  };

  return (
    <>
      <div className="page-head"><div><h1>Дүн оруулах</h1><p className="muted">Сурагчийн дүнг бүртгэнэ</p></div></div>
      {message && <div className="notice">{message}</div>}
      <section className="card">
        <form className="form-grid" onSubmit={save}>
          <label>Сурагч<select value={form.student_id} onChange={e => setForm({...form, student_id:e.target.value})} required><option value="">Сонгох</option>{students.map(s=><option value={s.profile_id} key={s.profile_id}>{s.profiles?.last_name} {s.profiles?.first_name} ({s.student_id_code})</option>)}</select></label>
          <label>Хичээл<select value={form.subject_id} onChange={e => setForm({...form, subject_id:e.target.value})} required><option value="">Сонгох</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
          <label>Оноо<input type="number" min="0" max="100" value={form.score} onChange={e=>setForm({...form,score:e.target.value})} required /></label>
          <label>Төрөл<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{["ASSIGNMENT","QUIZ","EXAM","CLASSWORK","PARTICIPATION"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Улирал / жил<input value={form.period} onChange={e=>setForm({...form,period:e.target.value})} /></label>
          <div><button className="primary">Хадгалах</button></div>
        </form>
      </section>
    </>
  );
}