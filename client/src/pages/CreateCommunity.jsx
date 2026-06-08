import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

const CATEGORIES = ["General", "Women in Tech", "Open Source", "Career", "Content", "Frontend", "Backend", "Data Science", "DevOps"];

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    category: "General",
    description: "",
    cover: "",
    link: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { community } = await api.createCommunity(form);
      navigate(`/c/${community.slug}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 640, margin: "40px auto" }}>
      <h1 className="section-title">Start a community</h1>
      <form className="panel" onSubmit={submit}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Name *</label>
          <input value={form.name} onChange={update("name")} placeholder="e.g. React Enthusiasts" required />
        </div>
        <div className="field">
          <label>Tagline</label>
          <input value={form.tagline} onChange={update("tagline")} placeholder="A short, punchy one-liner" />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={form.category} onChange={update("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={update("description")} placeholder="What is this community about?" />
        </div>
        <div className="field">
          <label>Cover image URL</label>
          <input value={form.cover} onChange={update("cover")} placeholder="https://…" />
        </div>
        <div className="field">
          <label>External link</label>
          <input value={form.link} onChange={update("link")} placeholder="https://…" />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy || !form.name.trim()}>
          {busy ? "Creating…" : "Create community"}
        </button>
      </form>
    </div>
  );
}
