import db from "../db.js";

const publicColumns = "id, name, email, avatar, bio, created_at";

export function createUser({ name, email, password, avatar }) {
  const stmt = db.prepare(
    `INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(name, email, password, avatar ?? null);
  return findById(info.lastInsertRowid);
}

export function findById(id) {
  return db.prepare(`SELECT ${publicColumns} FROM users WHERE id = ?`).get(id);
}

// Includes password hash — only for auth checks, never sent to clients.
export function findByEmailWithPassword(email) {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

export function emailExists(email) {
  return !!db.prepare(`SELECT 1 FROM users WHERE email = ?`).get(email);
}

export function updateProfile(id, { name, bio, avatar }) {
  db.prepare(
    `UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar) WHERE id = ?`
  ).run(name ?? null, bio ?? null, avatar ?? null, id);
  return findById(id);
}
