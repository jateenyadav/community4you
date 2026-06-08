import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as Communities from "../repositories/communities.js";

const router = Router();

// GET /api/me/communities  -> communities the user owns + has joined
router.get("/communities", requireAuth, (req, res) => {
  res.json({
    owned: Communities.listByOwner(req.user.id),
    joined: Communities.listByMember(req.user.id),
  });
});

export default router;
