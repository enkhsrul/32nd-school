import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [stats,setStats]=useState({users:0,students:0,classes:0,subjects:0});
  useEffect(()=>{(async()=>{
    const [u,s,c,sub]=await Promise.all([
      supabase.from("profiles").select("id",{count:"exact",head:true}),
      supabase.from("students").select("profile_id",{count:"exact",head:true}),
      supabase.from("classes").select("id",{count:"exact",head:true}),
      supabase.from("subjects").select("id",{count:"exact",head:true})
    ]);
    setStats({users:u.count||0,students:s.count||0,classes:c.count||0,subjects:sub.count||0});
  })()},[]);
  return <><div className="page-head"><div><h1>Админ хянах самбар</h1><p className="muted">32-р сургуулийн системийн тойм</p></div></div>
  <div className="stats-grid">{Object.entries({users:"Хэрэглэгч",students:"Сурагч",classes:"Анги",subjects:"Хичээл"}).map(([k,v])=><div className="stat-card" key={k}><div><span>{v}</span><strong>{stats[k]}</strong></div></div>)}</div>
  <div className="card"><h2>Систем ажиллаж байна</h2><p className="muted">Өгөгдлийн сан болон authentication холболтыг Supabase удирдана.</p></div></>;
}