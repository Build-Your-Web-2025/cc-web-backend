// routes/adminRoutes.js
import express from "express";
import { adminProtect } from "../middleware/authMiddleware.js";
import {
    getAdminSummary,
    getAllUsers,
    deleteUser,
    updateUserByAdmin
} from "../controllers/adminController.js";

const router = express.Router();

// GET /api/admin/summary
router.get("/summary", adminProtect, getAdminSummary);

// User Management
router.get("/users", adminProtect, getAllUsers);
router.delete("/users/:id", adminProtect, deleteUser);
router.put("/users/:id", adminProtect, updateUserByAdmin);

export default router;