import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import CommunityCard from "../components/CommunityCard.jsx";
import Spinner from "../components/Spinner.jsx";

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Explore() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounced(search);

  useEffect(() => {
    api.categories().then(({ categories }) => setCategories(categories)).catch(() => {});
    api.stats().then(({ stats }) => setStats(stats)).catch(() => {});
    api.trending().then(({ communities }) => setTrending(communities)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .listCommunities({ search: debouncedSearch, category, sort })
      .then(({ communities }) => setCommunities(communities))
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, sort]);

  const chips = useMemo(() => ["All", ...categories.map((c) => c.category)], [categories]);

  return (
    <>
      <section className="hero container">
        <h1>
          Find your people in <span className="grad">tech</span>.
        </h1>
        <p>
          Discover and join developer communities, share posts, react, and discuss.
          A full-stack platform with real auth, a database, and a clean API.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to="/create" className="btn btn-primary">
              Start a community
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Join free
              </Link>
              <Link to="/login" className="btn btn-ghost">
                I have an account
              </Link>
            </>
          )}
        </div>

        {stats && (
          <div className="stat-grid">
            <StatCard label="Communities" value={stats.communities} />
            <StatCard label="Members" value={stats.members} />
            <StatCard label="Posts" value={stats.posts} />
            <StatCard label="Builders" value={stats.users} />
          </div>
        )}
      </section>

      <section className="container explore-layout" style={{ paddingBottom: 40 }}>
        <div>
          <div className="toolbar">
            <div className="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                placeholder="Search communities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="chip" value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "8px 14px" }}>
              <option value="recent">Newest</option>
              <option value="popular">Most members</option>
            </select>
          </div>

          <div className="chips" style={{ marginBottom: 26 }}>
            {chips.map((c) => (
              <button
                key={c}
                className={`chip ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : communities.length === 0 ? (
            <div className="empty">
              <p>No communities match your search.</p>
            </div>
          ) : (
            <div className="grid">
              {communities.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
            </div>
          )}
        </div>

        <aside className="explore-aside">
          <div className="panel">
            <h3 className="aside-title">🔥 Trending</h3>
            {trending.length === 0 ? (
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Nothing trending yet.</p>
            ) : (
              <ol className="trending-list">
                {trending.map((t, i) => (
                  <li key={t.id}>
                    <span className="trending-rank">{i + 1}</span>
                    <Link to={`/c/${t.slug}`} className="trending-link">
                      <strong>{t.name}</strong>
                      <span className="muted">{t.member_count} members · {t.post_count} posts</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
