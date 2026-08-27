import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Users() {
  const [users,setUsers]=useState([]);
  const load=()=>supabase.from("profiles").select("id,first_name,last_name,email,role,created_at").order("created_at",{ascending:false}).then(({data})=>setUsers(data||[]));
  useEffect(()=>{load()},[]);
  return <><div className="page-head"><div><h1>Хэрэглэгчид</h1><p className="muted">Системийн бүх профайл</p></div></div>
  <section className="card"><div className="table-wrap"><table><thead><tr><th>Нэр</th><th>Email</th><th>Role</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.last_name} {u.first_name}</td><td>{u.email}</td><td><span className="badge">{u.role}</span></td></tr>)}</tbody></table></div></section></>;
}