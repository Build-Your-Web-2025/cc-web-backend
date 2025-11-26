// routes/commentRoutes.js
import express from "express";
import { userOrAdminProtect } from "../middleware/authMiddleware.js";
import {
  getCommentsForPost,
  addCommentToPost,
} from "../controllers/commentController.js";

const router = express.Router({ mergeParams: true });

// /api/posts/:postId/comments
router.get("/", userOrAdminProtect, getCommentsForPost);
router.post("/", userOrAdminProtect, addCommentToPost);

export default router;
