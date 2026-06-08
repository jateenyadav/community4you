import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const doLogin = async (credentials) => {
    setError("");
    setBusy(true);
    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    doLogin({ email, password });
  };

  const useDemo = () => {
    setEmail("demo@community4you.dev");
    setPassword("demo1234");
    doLogin({ email: "demo@community4you.dev", password: "demo1234" });
  };

  return (
    <div className="container auth-wrap">
      <div className="panel">
        <h1 style={{ margin: "0 0 6px", letterSpacing: "-0.02em" }}>Welcome back</h1>
        <p className="muted" style={{ marginTop: 0 }}>Log in to your Community4You account.</p>
        <form onSubmit={submit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <button className="btn btn-ghost btn-block" onClick={useDemo} disabled={busy} style={{ marginTop: 10 }}>
          Use demo account
        </button>
        <p className="muted center" style={{ marginBottom: 0, marginTop: 18 }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--accent)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
