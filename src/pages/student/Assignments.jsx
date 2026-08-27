import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Assignments() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!profile) return;
    supabase.from("students").select("class_id").eq("profile_id",profile.id).maybeSingle().then(async ({data:s})=>{
      if (!s?.class_id) return;
      const {data} = await supabase.from("assignments").select("id,title,description,due_date,max_score,subjects(name)").eq("class_id",s.class_id).order("due_date");
      setItems(data||[]);
    });
  }, [profile]);
  return <><div className="page-head"><div><h1>Даалгавар</h1><p className="muted">Таны ангид өгсөн даалгаврууд</p></div></div>
    <div className="cards">{items.map(x=><div className="card" key={x.id}><h2>{x.title}</h2><p>{x.description||"Тайлбар байхгүй."}</p><p className="muted">{x.subjects?.name} · Дуусах: {new Date(x.due_date).toLocaleString("mn-MN")}</p></div>)}{!items.length&&<div className="card"><p className="muted">Даалгавар алга.</p></div>}</div>
  </>;
}