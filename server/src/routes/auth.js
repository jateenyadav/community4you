import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken, requireAuth } from "../middleware/auth.js";
import {
  createUser,
  emailExists,
  findByEmailWithPassword,
  updateProfile,
} from "../repositories/users.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function avatarFor(name) {
  const seed = encodeURIComponent(name.trim() || "user");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (emailExists(email.toLowerCase())) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const user = createUser({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hash,
    avatar: avatarFor(name),
  });
  const token = signToken(user.id);
  res.status(201).json({ user, token });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const record = findByEmailWithPassword(email.toLowerCase());
  if (!record || !bcrypt.compareSync(password, record.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const { password: _omit, ...user } = record;
  const token = signToken(user.id);
  res.json({ user, token });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch("/me", requireAuth, (req, res) => {
  const { name, bio, avatar } = req.body || {};
  const user = updateProfile(req.user.id, { name, bio, avatar });
  res.json({ user });
});

export default router;
