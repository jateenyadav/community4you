import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import * as Communities from "../repositories/communities.js";
import * as Posts from "../repositories/posts.js";

const router = Router();

// GET /api/communities?search=&category=&sort=
router.get("/", (req, res) => {
  const { search, category, sort } = req.query;
  res.json({ communities: Communities.list({ search, category, sort }) });
});

// GET /api/communities/categories
router.get("/categories", (_req, res) => {
  res.json({ categories: Communities.categories() });
});

// GET /api/communities/stats  (global platform stats)
router.get("/stats", (_req, res) => {
  res.json({ stats: Communities.stats() });
});

// GET /api/communities/trending
router.get("/trending", (_req, res) => {
  res.json({ communities: Communities.trending(5) });
});

// POST /api/communities
router.post("/", requireAuth, (req, res) => {
  const { name, tagline, description, category, cover, link } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Community name is required" });
  }
  const community = Communities.createCommunity({
    name: name.trim(),
    tagline,
    description,
    category,
    cover,
    link,
    ownerId: req.user.id,
  });
  res.status(201).json({ community });
});

// GET /api/communities/:slug  (includes membership flag when authed)
router.get("/:slug", optionalAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  const isMember = req.user ? Communities.isMember(req.user.id, community.id) : false;
  const isOwner = req.user ? req.user.id === community.owner_id : false;
  res.json({
    community: { ...community, isMember, isOwner },
    members: Communities.members(community.id),
    posts: Posts.listByCommunity(community.id, req.user ? req.user.id : 0),
  });
});

// PATCH /api/communities/:slug  (owner only)
router.patch("/:slug", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  if (community.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Only the owner can edit this community" });
  }
  res.json({ community: Communities.update(community.id, req.body || {}) });
});

// DELETE /api/communities/:slug  (owner only)
router.delete("/:slug", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  if (community.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Only the owner can delete this community" });
  }
  Communities.remove(community.id);
  res.json({ ok: true });
});

// POST /api/communities/:slug/join
router.post("/:slug/join", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  Communities.join(req.user.id, community.id);
  res.json({ community: { ...Communities.findById(community.id), isMember: true } });
});

// DELETE /api/communities/:slug/join  (leave)
router.delete("/:slug/join", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  if (community.owner_id === req.user.id) {
    return res.status(400).json({ error: "The owner cannot leave their own community" });
  }
  Communities.leave(req.user.id, community.id);
  res.json({ community: { ...Communities.findById(community.id), isMember: false } });
});

// POST /api/communities/:slug/posts  (members only)
router.post("/:slug/posts", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  if (!Communities.isMember(req.user.id, community.id)) {
    return res.status(403).json({ error: "Join the community to post" });
  }
  const { title, body } = req.body || {};
  if (!title || !title.trim() || !body || !body.trim()) {
    return res.status(400).json({ error: "Title and body are required" });
  }
  const post = Posts.create({
    communityId: community.id,
    authorId: req.user.id,
    title: title.trim(),
    body: body.trim(),
  });
  res.status(201).json({ post });
});

// DELETE /api/communities/:slug/posts/:postId  (author or owner)
router.delete("/:slug/posts/:postId", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  const post = Posts.findById(Number(req.params.postId));
  if (!post || post.community_id !== community.id) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (post.author_id !== req.user.id && community.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Not allowed to delete this post" });
  }
  Posts.remove(post.id);
  res.json({ ok: true });
});

// POST /api/communities/:slug/posts/:postId/like  (members toggle a like)
router.post("/:slug/posts/:postId/like", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  const post = Posts.findById(Number(req.params.postId), req.user.id);
  if (!post || post.community_id !== community.id) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (post.liked) Posts.unlike(post.id, req.user.id);
  else Posts.like(post.id, req.user.id);
  res.json({ post: Posts.findById(post.id, req.user.id) });
});

// GET /api/communities/:slug/posts/:postId/comments
router.get("/:slug/posts/:postId/comments", optionalAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  res.json({ comments: Posts.listComments(Number(req.params.postId)) });
});

// POST /api/communities/:slug/posts/:postId/comments  (members only)
router.post("/:slug/posts/:postId/comments", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  if (!Communities.isMember(req.user.id, community.id)) {
    return res.status(403).json({ error: "Join the community to comment" });
  }
  const post = Posts.findById(Number(req.params.postId), req.user.id);
  if (!post || post.community_id !== community.id) {
    return res.status(404).json({ error: "Post not found" });
  }
  const { body } = req.body || {};
  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }
  const comment = Posts.createComment({ postId: post.id, authorId: req.user.id, body: body.trim() });
  res.status(201).json({ comment });
});

// DELETE /api/communities/:slug/posts/:postId/comments/:commentId  (author or community owner)
router.delete("/:slug/posts/:postId/comments/:commentId", requireAuth, (req, res) => {
  const community = Communities.findBySlug(req.params.slug);
  if (!community) return res.status(404).json({ error: "Community not found" });
  const comment = Posts.findComment(Number(req.params.commentId));
  if (!comment || comment.post_id !== Number(req.params.postId)) {
    return res.status(404).json({ error: "Comment not found" });
  }
  if (comment.author_id !== req.user.id && community.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Not allowed to delete this comment" });
  }
  Posts.removeComment(comment.id);
  res.json({ ok: true });
});

export default router;
