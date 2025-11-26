// controllers/eventController.js
import Event from "../models/Event.js";

//
// GET /api/events
// Optional query: ?department=BCA&date=2025-12-01
//
export const getEvents = async (req, res) => {
  try {
    const { department, date } = req.query;
    const filter = {};

    if (department) filter.department = department;

    if (date) {
      // date filter: all events on that day
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const events = await Event.find(filter)
      .populate("createdBy", "name email department designation")
      .populate("rsvps", "name department year")
      .sort({ date: 1 });

    res.json({message:"Events fetched Successfully",events});
  } catch (err) {
    console.error("getEvents error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// POST /api/events
// Admin only (adminProtect)
//
export const createEvent = async (req, res) => {
    try {
      const { title, description, date, location, department, imageUrl } = req.body;
  
      if (!title || !date) {
        return res.status(400).json({ message: "Title and date are required" });
      }
  
      const eventDate = new Date(date + "T00:00:00");
  
      const event = await Event.create({
        title,
        description,
        date: eventDate,
        location,
        department,
        imageUrl,
        createdBy: req.admin._id,
      });
  
      // ✅ Re-fetch with populate (no execPopulate, no chaining problem)
      const populated = await Event.findById(event._id)
        .populate("createdBy", "name email department designation")
        .populate("rsvps", "name department year");
  
      res.status(201).json(populated);
    } catch (err) {
      console.error("createEvent error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  

//
// GET /api/events/:id
//
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email department designation")
      .populate("rsvps", "name department year");

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (err) {
    console.error("getEventById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// POST /api/events/:id/rsvp
// Student toggles RSVP
//
export const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id.toString();
    const already = event.rsvps.some((id) => id.toString() === userId);

    if (already) {
      // remove RSVP
      event.rsvps = event.rsvps.filter((id) => id.toString() !== userId);
    } else {
      // add RSVP
      event.rsvps.push(req.user._id);
    }

    await event.save();

    res.json({
      message: already ? "RSVP removed" : "RSVP added",
      rsvpsCount: event.rsvps.length,
    });
  } catch (err) {
    console.error("rsvpEvent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// PUT /api/events/:id
// Admin can edit event
//
export const updateEvent = async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
  
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Only the creator admin can edit (optional)
      if (event.createdBy.toString() !== req.admin._id.toString()) {
        return res
          .status(403)
          .json({ message: "Only creator admin can edit this event" });
      }
  
      const fields = ["title", "description", "location", "department", "imageUrl"];
  
      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          event[field] = req.body[field];
        }
      });
  
      // 🔥 Handle date separately to control timezone
      if (req.body.date !== undefined) {
        // expect `date` as "YYYY-MM-DD" from frontend
        event.date = new Date(req.body.date + "T00:00:00");
      }
  
      await event.save();
  
      const populated = await Event.findById(event._id)
        .populate("createdBy", "name email department designation")
        .populate("rsvps", "name department year");
  
      res.json({
        message: "Event updated",
        event: populated,
      });
    } catch (err) {
      console.error("updateEvent error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  

//
// DELETE /api/events/:id
// Admin can delete event
//
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: "Only creator admin can delete this event" });
    }

    await event.deleteOne();

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("deleteEvent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
