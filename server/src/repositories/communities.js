import db from "../db.js";

const baseSelect = `
  SELECT
    c.id, c.name, c.slug, c.tagline, c.description, c.category,
    c.cover, c.link, c.owner_id, c.created_at,
    u.name AS owner_name,
    (SELECT COUNT(*) FROM memberships m WHERE m.community_id = c.id) AS member_count,
    (SELECT COUNT(*) FROM posts p WHERE p.community_id = c.id) AS post_count
  FROM communities c
  JOIN users u ON u.id = c.owner_id
`;

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(name) {
  let base = slugify(name) || "community";
  let slug = base;
  let n = 1;
  while (db.prepare(`SELECT 1 FROM communities WHERE slug = ?`).get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function createCommunity({ name, tagline, description, category, cover, link, ownerId }) {
  const slug = uniqueSlug(name);
  const info = db
    .prepare(
      `INSERT INTO communities (name, slug, tagline, description, category, cover, link, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, slug, tagline ?? "", description ?? "", category ?? "General", cover ?? null, link ?? "", ownerId);
  // Owner automatically becomes an admin member.
  db.prepare(
    `INSERT OR IGNORE INTO memberships (user_id, community_id, role) VALUES (?, ?, 'admin')`
  ).run(ownerId, info.lastInsertRowid);
  return findById(info.lastInsertRowid);
}

export function findById(id) {
  return db.prepare(`${baseSelect} WHERE c.id = ?`).get(id);
}

export function findBySlug(slug) {
  return db.prepare(`${baseSelect} WHERE c.slug = ?`).get(slug);
}

export function list({ search, category, sort } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push(`(c.name LIKE ? OR c.tagline LIKE ? OR c.description LIKE ?)`);
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (category && category !== "All") {
    where.push(`c.category = ?`);
    params.push(category);
  }
  let sql = baseSelect;
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += sort === "popular" ? ` ORDER BY member_count DESC, c.created_at DESC` : ` ORDER BY c.created_at DESC`;
  return db.prepare(sql).all(...params);
}

export function listByOwner(ownerId) {
  return db.prepare(`${baseSelect} WHERE c.owner_id = ? ORDER BY c.created_at DESC`).all(ownerId);
}

export function listByMember(userId) {
  return db
    .prepare(
      `${baseSelect} JOIN memberships mm ON mm.community_id = c.id
       WHERE mm.user_id = ? ORDER BY mm.created_at DESC`
    )
    .all(userId);
}

export function categories() {
  return db
    .prepare(`SELECT category, COUNT(*) AS count FROM communities GROUP BY category ORDER BY count DESC`)
    .all();
}

export function stats() {
  const communities = db.prepare(`SELECT COUNT(*) AS n FROM communities`).get().n;
  const members = db.prepare(`SELECT COUNT(*) AS n FROM memberships`).get().n;
  const posts = db.prepare(`SELECT COUNT(*) AS n FROM posts`).get().n;
  const users = db.prepare(`SELECT COUNT(*) AS n FROM users`).get().n;
  return { communities, members, posts, users };
}

export function trending(limit = 5) {
  return db
    .prepare(`${baseSelect} ORDER BY member_count DESC, post_count DESC, c.created_at DESC LIMIT ?`)
    .all(limit);
}

export function update(id, fields) {
  db.prepare(
    `UPDATE communities
     SET name = COALESCE(?, name), tagline = COALESCE(?, tagline),
         description = COALESCE(?, description), category = COALESCE(?, category),
         cover = COALESCE(?, cover), link = COALESCE(?, link)
     WHERE id = ?`
  ).run(
    fields.name ?? null,
    fields.tagline ?? null,
    fields.description ?? null,
    fields.category ?? null,
    fields.cover ?? null,
    fields.link ?? null,
    id
  );
  return findById(id);
}

export function remove(id) {
  return db.prepare(`DELETE FROM communities WHERE id = ?`).run(id);
}

// --- Membership ---

export function isMember(userId, communityId) {
  return !!db
    .prepare(`SELECT 1 FROM memberships WHERE user_id = ? AND community_id = ?`)
    .get(userId, communityId);
}

export function join(userId, communityId) {
  db.prepare(
    `INSERT OR IGNORE INTO memberships (user_id, community_id, role) VALUES (?, ?, 'member')`
  ).run(userId, communityId);
}

export function leave(userId, communityId) {
  db.prepare(`DELETE FROM memberships WHERE user_id = ? AND community_id = ?`).run(userId, communityId);
}

export function members(communityId) {
  return db
    .prepare(
      `SELECT u.id, u.name, u.avatar, m.role, m.created_at
       FROM memberships m JOIN users u ON u.id = m.user_id
       WHERE m.community_id = ? ORDER BY m.created_at ASC`
    )
    .all(communityId);
}

export { slugify };
