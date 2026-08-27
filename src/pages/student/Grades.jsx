import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentGrades() {
  const { profile } = useAuth();
  const [grades, setGrades] = useState([]);
  useEffect(() => {
    if (!profile) return;
    supabase.from("grades").select("score,type,period,created_at,subjects(name)")
      .eq("student_id", profile.id).order("created_at",{ascending:false}).then(({data})=>setGrades(data||[]));
  }, [profile]);

  return <><div className="page-head"><div><h1>Миний дүн</h1><p className="muted">Бүх бүртгэгдсэн дүн</p></div></div>
    <section className="card"><div className="table-wrap"><table><thead><tr><th>Хичээл</th><th>Төрөл</th><th>Улирал</th><th>Оноо</th></tr></thead>
    <tbody>{grades.map((g,i)=><tr key={i}><td>{g.subjects?.name}</td><td>{g.type}</td><td>{g.period}</td><td><strong>{g.score}</strong></td></tr>)}</tbody></table></div>{!grades.length&&<p className="muted">Дүн байхгүй.</p>}</section>
  </>;
}