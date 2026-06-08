import db from "../db.js";

const selectFor = (viewerId) => `
  SELECT p.id, p.community_id, p.author_id, p.title, p.body, p.created_at,
         u.name AS author_name, u.avatar AS author_avatar,
         (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count,
         (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS comment_count,
         EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${Number(viewerId) || 0}) AS liked
  FROM posts p JOIN users u ON u.id = p.author_id
`;

export function create({ communityId, authorId, title, body }) {
  const info = db
    .prepare(`INSERT INTO posts (community_id, author_id, title, body) VALUES (?, ?, ?, ?)`)
    .run(communityId, authorId, title, body);
  return findById(info.lastInsertRowid, authorId);
}

export function findById(id, viewerId = 0) {
  return db.prepare(`${selectFor(viewerId)} WHERE p.id = ?`).get(id);
}

export function listByCommunity(communityId, viewerId = 0) {
  return db
    .prepare(`${selectFor(viewerId)} WHERE p.community_id = ? ORDER BY p.created_at DESC`)
    .all(communityId);
}

export function remove(id) {
  return db.prepare(`DELETE FROM posts WHERE id = ?`).run(id);
}

// --- Likes ---

export function like(postId, userId) {
  db.prepare(`INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)`).run(postId, userId);
}

export function unlike(postId, userId) {
  db.prepare(`DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`).run(postId, userId);
}

// --- Comments ---

const commentSelect = `
  SELECT c.id, c.post_id, c.author_id, c.body, c.created_at,
         u.name AS author_name, u.avatar AS author_avatar
  FROM comments c JOIN users u ON u.id = c.author_id
`;

export function createComment({ postId, authorId, body }) {
  const info = db
    .prepare(`INSERT INTO comments (post_id, author_id, body) VALUES (?, ?, ?)`)
    .run(postId, authorId, body);
  return db.prepare(`${commentSelect} WHERE c.id = ?`).get(info.lastInsertRowid);
}

export function listComments(postId) {
  return db.prepare(`${commentSelect} WHERE c.post_id = ? ORDER BY c.created_at ASC`).all(postId);
}

export function findComment(id) {
  return db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id);
}

export function removeComment(id) {
  return db.prepare(`DELETE FROM comments WHERE id = ?`).run(id);
}
