import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="container auth-wrap">
      <div className="panel">
        <h1 style={{ margin: "0 0 6px", letterSpacing: "-0.02em" }}>Create your account</h1>
        <p className="muted" style={{ marginTop: 0 }}>Join the community in seconds.</p>
        <form onSubmit={submit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={update("name")} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Creating…" : "Sign up"}
          </button>
        </form>
        <p className="muted center" style={{ marginBottom: 0, marginTop: 18 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
