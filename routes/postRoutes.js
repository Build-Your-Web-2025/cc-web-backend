// routes/postRoutes.js
import express from "express";
import { userProtect, userOrAdminProtect } from "../middleware/authMiddleware.js";
import {
  getPosts,
  createPost,
  getPostById,
  toggleLikePost,
} from "../controllers/postController.js";

const router = express.Router();

// /api/posts
router.get("/", userOrAdminProtect, getPosts);
router.post("/newpost", userProtect, createPost);

// /api/posts/:id
router.get("/:id", userOrAdminProtect, getPostById);
router.post("/:id/like", userProtect, toggleLikePost);

export default router;
