import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Spinner from "../components/Spinner.jsx";
import PostCard from "../components/PostCard.jsx";

const FALLBACK = "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function CommunityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postError, setPostError] = useState("");

  const [editing, setEditing] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getCommunity(slug)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="container empty">
        <p>{error}</p>
        <Link to="/" className="btn btn-ghost">
          Back to Explore
        </Link>
      </div>
    );

  const { community, members, posts } = data;

  const toggleMembership = async () => {
    if (!user) return navigate("/login", { state: { from: `/c/${slug}` } });
    setBusy(true);
    try {
      if (community.isMember) {
        await api.leave(slug);
        toast.info(`Left ${community.name}`);
      } else {
        await api.join(slug);
        toast.success(`Joined ${community.name}`);
      }
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    setPostError("");
    try {
      await api.createPost(slug, { title, body });
      setTitle("");
      setBody("");
      toast.success("Post published");
      load();
    } catch (err) {
      setPostError(err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.deletePost(slug, postId);
      toast.info("Post deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!confirm("Delete this community permanently? This cannot be undone.")) return;
    try {
      await api.deleteCommunity(slug);
      toast.info("Community deleted");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      <div className="detail-hero">
        <div className="detail-cover">
          <img src={community.cover || FALLBACK} alt={community.name} />
        </div>
        <div className="detail-body">
          <div className="row-between">
            <div>
              <span className="card-cat" style={{ position: "static", display: "inline-block", marginBottom: 8 }}>
                {community.category}
              </span>
              <h1 style={{ margin: "0 0 6px", letterSpacing: "-0.02em" }}>{community.name}</h1>
              <p className="muted" style={{ margin: 0 }}>{community.tagline}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {community.isOwner ? (
                <>
                  <button className="btn btn-ghost" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={handleDeleteCommunity}>
                    Delete
                  </button>
                </>
              ) : (
                <button
                  className={`btn ${community.isMember ? "btn-ghost" : "btn-primary"}`}
                  onClick={toggleMembership}
                  disabled={busy}
                >
                  {community.isMember ? "Leave" : "Join community"}
                </button>
              )}
            </div>
          </div>
          <div className="card-meta" style={{ marginTop: 14 }}>
            <span>👥 {community.member_count} members</span>
            <span>📝 {community.post_count} posts</span>
            <span>👤 Created by {community.owner_name}</span>
            {community.link && (
              <a href={community.link} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                🔗 Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="layout-2">
        <div>
          <h2 className="section-title">Description</h2>
          <p className="muted" style={{ marginTop: 0, lineHeight: 1.6 }}>
            {community.description || "No description yet."}
          </p>

          <h2 className="section-title" style={{ marginTop: 32 }}>
            Posts
          </h2>

          {community.isMember && (
            <form className="panel" onSubmit={submitPost} style={{ marginBottom: 20 }}>
              {postError && <div className="alert alert-error">{postError}</div>}
              <div className="field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Share an update…" />
              </div>
              <div className="field">
                <label>Body</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's on your mind?" />
              </div>
              <button className="btn btn-primary" disabled={!title.trim() || !body.trim()}>
                Post
              </button>
            </form>
          )}

          {posts.length === 0 ? (
            <div className="empty">No posts yet. {community.isMember ? "Be the first!" : "Join to start the conversation."}</div>
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                slug={slug}
                post={p}
                canModerate={community.isOwner}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </div>

        <aside>
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Members · {members.length}</h3>
            {members.map((m) => (
              <div className="member" key={m.id}>
                <img src={m.avatar} alt={m.name} />
                <span>{m.name}</span>
                {m.role !== "member" && <span className="badge">{m.role}</span>}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {editing && (
        <EditCommunityModal
          slug={slug}
          community={community}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            toast.success("Community updated");
            load();
          }}
        />
      )}
    </div>
  );
}

function EditCommunityModal({ slug, community, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: community.name || "",
    tagline: community.tagline || "",
    description: community.description || "",
    category: community.category || "",
    cover: community.cover || "",
    link: community.link || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateCommunity(slug, form);
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Edit community</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={save}>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={set("name")} required />
          </div>
          <div className="field">
            <label>Tagline</label>
            <input value={form.tagline} onChange={set("tagline")} placeholder="One line that sells it" />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={form.category} onChange={set("category")} placeholder="e.g. Design, AI, Web3" />
          </div>
          <div className="field">
            <label>Cover image URL</label>
            <input value={form.cover} onChange={set("cover")} placeholder="https://…" />
          </div>
          <div className="field">
            <label>Website</label>
            <input value={form.link} onChange={set("link")} placeholder="https://…" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={set("description")} rows={4} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving || !form.name.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
