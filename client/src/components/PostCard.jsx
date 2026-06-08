import { useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function PostCard({ slug, post, canModerate, onDelete }) {
  const { user } = useAuth();
  const toast = useToast();

  const [liked, setLiked] = useState(!!post.liked);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [likeBusy, setLikeBusy] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  const canDelete = user?.id === post.author_id || canModerate;

  const handleLike = async () => {
    if (!user) return toast.error("Sign in to react to posts.");
    setLikeBusy(true);
    try {
      const { post: updated } = await api.toggleLike(slug, post.id);
      setLiked(!!updated.liked);
      setLikeCount(updated.like_count);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLikeBusy(false);
    }
  };

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) {
      try {
        const { comments: list } = await api.listComments(slug, post.id);
        setComments(list);
      } catch (e) {
        toast.error(e.message);
        setComments([]);
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setCommentBusy(true);
    try {
      const { comment } = await api.addComment(slug, post.id, { body: commentBody.trim() });
      setComments((list) => [...(list || []), comment]);
      setCommentCount((n) => n + 1);
      setCommentBody("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCommentBusy(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.deleteComment(slug, post.id, commentId);
      setComments((list) => list.filter((c) => c.id !== commentId));
      setCommentCount((n) => Math.max(0, n - 1));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <article className="post">
      <div className="post-head">
        <img src={post.author_avatar} alt={post.author_name} />
        <div>
          <strong>{post.author_name}</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
        {canDelete && (
          <button
            className="btn btn-danger"
            style={{ marginLeft: "auto", padding: "6px 12px" }}
            onClick={() => onDelete(post.id)}
          >
            Delete
          </button>
        )}
      </div>

      <h3 style={{ margin: "0 0 6px" }}>{post.title}</h3>
      <p className="muted" style={{ margin: "0 0 14px", lineHeight: 1.55 }}>{post.body}</p>

      <div className="post-actions">
        <button
          className={`icon-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={likeBusy}
          aria-pressed={liked}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          {likeCount}
        </button>
        <button className="icon-btn" onClick={toggleComments}>
          <span>💬</span>
          {commentCount}
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {comments === null ? (
            <p className="muted" style={{ fontSize: 13 }}>Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div className="comment" key={c.id}>
                <img src={c.author_avatar} alt={c.author_name} />
                <div className="c-body">
                  <div className="c-head">
                    <strong>{c.author_name}</strong>
                    <span className="muted">{new Date(c.created_at).toLocaleDateString()}</span>
                    {(user?.id === c.author_id || canModerate) && (
                      <button className="c-del" onClick={() => deleteComment(c.id)} aria-label="Delete comment">
                        ✕
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0 }}>{c.body}</p>
                </div>
              </div>
            ))
          )}

          {user && (
            <form className="comment-form" onSubmit={submitComment}>
              <input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment…"
              />
              <button className="btn btn-primary" disabled={commentBusy || !commentBody.trim()}>
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
