// routes/eventRoutes.js
import express from "express";
import { userProtect, adminProtect } from "../middleware/authMiddleware.js";
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
router.get("/", userProtect, getEvents);        // or adminProtect also works, but userProtect is fine
router.get("/:id", userProtect, getEventById);

// Admin-only create/update/delete
router.post("/newevent", adminProtect, createEvent);
router.put("/update/:id", adminProtect, updateEvent);
router.delete("/:id", adminProtect, deleteEvent);

// Students RSVP
router.post("/:id/rsvp", userProtect, rsvpEvent);

export default router;
