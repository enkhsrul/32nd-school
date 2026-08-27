import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, Lock, Mail } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = mode === "login"
      ? await login(form.email, form.password)
      : await signup(form.email, form.password, form.firstName, form.lastName);
    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup") {
      setError("Бүртгэл үүслээ. Email баталгаажуулах шаардлагатай байж болно.");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><GraduationCap size={42} /></div>
        <h1>32-р Сургууль</h1>
        <p className="muted">Удирдлагын систем</p>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <label>Нэр<input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></label>
              <label>Овог<input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></label>
            </>
          )}
          <label><Mail size={16}/> Email
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </label>
          <label><Lock size={16}/> Нууц үг
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={6} required />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="primary full" disabled={busy}>{busy ? "Түр хүлээнэ үү..." : mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}</button>
        </form>

        <button className="link-button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
          {mode === "login" ? "Шинэ хэрэглэгч үүсгэх" : "Нэвтрэх хэсэг рүү буцах"}
        </button>
      </div>
    </div>
  );
}