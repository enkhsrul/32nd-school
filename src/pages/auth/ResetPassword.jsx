import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase тохиргоо олдсонгүй.");
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Нууц үг амжилттай шинэчлэгдлээ. Нэвтрэх хуудас руу шилжүүлж байна...");
    window.setTimeout(() => navigate("/login", { replace: true }), 1200);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Lock size={42} /></div>
        <h1>Шинэ нууц үг</h1>
        <p className="muted">Имэйлээр ирсэн сэргээх холбоосоор нээсэн бол шинэ нууц үгээ оруулна уу.</p>
        {!ready ? <p>Холбоосыг шалгаж байна. Хэрэв энэ хуудас удаан өөрчлөгдөхгүй бол имэйл дэх хамгийн сүүлийн сэргээх холбоосыг дахин нээнэ үү.</p> : (
          <form onSubmit={submit}>
            <label>Шинэ нууц үг
              <input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            <button className="primary full" disabled={busy}>{busy ? "Түр хүлээнэ үү..." : "Нууц үг шинэчлэх"}</button>
          </form>
        )}
        {message && <div className="error">{message}</div>}
        <Link className="link-button" to="/login">Нэвтрэх рүү буцах</Link>
      </div>
    </div>
  );
}
