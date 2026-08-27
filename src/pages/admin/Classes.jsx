import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Classes() {
  const [items,setItems]=useState([]);
  useEffect(()=>{supabase.from("classes").select("id,name,grade_level,profiles(first_name,last_name)").order("grade_level").then(({data})=>setItems(data||[]))},[]);
  return <><div className="page-head"><div><h1>Ангиуд</h1><p className="muted">Бүртгэлтэй ангиуд</p></div></div>
  <section className="card"><div className="table-wrap"><table><thead><tr><th>Анги</th><th>Түвшин</th><th>Анги даасан багш</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.grade_level}</td><td>{x.profiles?`${x.profiles.last_name} ${x.profiles.first_name}`:"Томилоогүй"}</td></tr>)}</tbody></table></div>{!items.length&&<p className="muted">Анги бүртгэгдээгүй байна.</p>}</section></>;
}