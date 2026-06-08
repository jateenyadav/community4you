import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import CommunityCard from "../components/CommunityCard.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState({ owned: [], joined: [] });
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saved, setSaved] = useState(false);
  const [savingError, setSavingError] = useState("");

  useEffect(() => {
    api
      .myCommunities()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaved(false);
    setSavingError("");
    try {
      const { user: updated } = await api.updateProfile({ name, bio });
      setUser(updated);
      setSaved(true);
    } catch (err) {
      setSavingError(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <div className="row-between" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img className="avatar" src={user.avatar} alt={user.name} style={{ width: 56, height: 56 }} />
          <div>
            <h1 style={{ margin: 0, letterSpacing: "-0.02em" }}>{user.name}</h1>
            <p className="muted" style={{ margin: 0 }}>{user.email}</p>
          </div>
        </div>
        <Link to="/create" className="btn btn-primary">
          New community
        </Link>
      </div>

      <div className="layout-2">
        <div>
          <h2 className="section-title">Communities you own</h2>
          {loading ? (
            <Spinner />
          ) : data.owned.length === 0 ? (
            <div className="empty">You haven't created any communities yet.</div>
          ) : (
            <div className="grid">
              {data.owned.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
            </div>
          )}

          <h2 className="section-title" style={{ marginTop: 36 }}>
            Communities you've joined
          </h2>
          {loading ? null : data.joined.length === 0 ? (
            <div className="empty">
              You haven't joined any communities. <Link to="/" style={{ color: "var(--accent)" }}>Explore</Link>.
            </div>
          ) : (
            <div className="grid">
              {data.joined.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
            </div>
          )}
        </div>

        <aside>
          <form className="panel" onSubmit={saveProfile}>
            <h3 style={{ marginTop: 0 }}>Edit profile</h3>
            {saved && <div className="alert alert-ok">Profile saved.</div>}
            {savingError && <div className="alert alert-error">{savingError}</div>}
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself" />
            </div>
            <button className="btn btn-primary btn-block">Save</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
