// routes/eventRoutes.js
import express from "express";
import { userProtect, adminProtect, userOrAdminProtect } from "../middleware/authMiddleware.js";
import {
  getEvents,
  createEvent,
  getEventById,
  rsvpEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

// Students + Admin can view events
router.get("/", userOrAdminProtect, getEvents);
router.get("/:id", userOrAdminProtect, getEventById);

// Admin-only create/update/delete
router.post("/newevent", adminProtect, createEvent);
router.put("/update/:id", adminProtect, updateEvent);
router.delete("/:id", adminProtect, deleteEvent);

// Students RSVP
router.post("/:id/rsvp", userProtect, rsvpEvent);

export default router;
