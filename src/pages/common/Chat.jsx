import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function Chat() {
  const { profile } = useAuth();
  const [conversations,setConversations]=useState([]);
  const [selected,setSelected]=useState(null);
  const [messages,setMessages]=useState([]);
  const [text,setText]=useState("");
  const [people,setPeople]=useState([]);

  useEffect(()=>{if(!profile)return;
    supabase.from("conversations").select("id,participant_1,participant_2,updated_at").or(`participant_1.eq.${profile.id},participant_2.eq.${profile.id}`).order("updated_at",{ascending:false}).then(({data})=>setConversations(data||[]));
    supabase.from("profiles").select("id,first_name,last_name,role").neq("id",profile.id).order("first_name").limit(100).then(({data})=>setPeople(data||[]));
  },[profile]);

  useEffect(()=>{
    if(!selected)return;
    supabase.from("messages").select("*").eq("conversation_id",selected).order("created_at",{ascending:true}).then(({data})=>setMessages(data||[]));
    const channel=supabase.channel(`chat-${selected}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`conversation_id=eq.${selected}`},payload=>setMessages(prev=>prev.some(x=>x.id===payload.new.id)?prev:[...prev,payload.new])).subscribe();
    return ()=>{supabase.removeChannel(channel)};
  },[selected]);

  const startConversation=async(personId)=>{
    const [a,b]=[profile.id,personId].sort();
    const {data,error}=await supabase.from("conversations").upsert({participant_1:a,participant_2:b},{onConflict:"participant_1,participant_2"}).select().single();
    if(!error){setSelected(data.id);setConversations(prev=>prev.some(x=>x.id===data.id)?prev:[data,...prev])}
  };

  const send=async(e)=>{e.preventDefault();if(!text.trim()||!selected)return;
    await supabase.from("messages").insert({conversation_id:selected,sender_id:profile.id,content:text.trim()});
    setText("");
  };

  const otherId=(c)=>c.participant_1===profile.id?c.participant_2:c.participant_1;
  const other=(c)=>people.find(p=>p.id===otherId(c));

  return <div className="chat-layout">
    <section className="card people"><h2>Хүмүүс</h2>{people.map(p=><button className="person" key={p.id} onClick={()=>startConversation(p.id)}>{p.last_name} {p.first_name}<small>{p.role}</small></button>)}</section>
    <section className="card chat-box"><div className="chat-head"><h2>{selected?(other(conversations.find(c=>c.id===selected))?.first_name||"Чат"):"Чат сонгоно уу"}</h2></div>
      <div className="messages">{messages.map(m=><div key={m.id} className={m.sender_id===profile.id?"bubble mine":"bubble"}>{m.content}</div>)}</div>
      <form className="chat-form" onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Мессеж бичих..." disabled={!selected}/><button className="primary" disabled={!selected}><Send size={18}/></button></form>
    </section>
  </div>;
}