// routes/adminRoutes.js
import express from "express";
import { adminProtect } from "../middleware/authMiddleware.js";
import { getAdminSummary } from "../controllers/adminController.js";

const router = express.Router();

// GET /api/admin/summary
router.get("/summary", adminProtect, getAdminSummary);

export default router;