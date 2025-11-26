// controllers/adminController.js
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Post from "../models/Post.js";
import Event from "../models/Event.js";
import Project from "../models/Project.js";

export const getAdminSummary = async (req, res) => {
  try {
    // You can add filters later (e.g., per department, per date, etc.)
    const [
      totalUsers,
      totalAdmins,
      totalPosts,
      totalEvents,
      totalProjects,
    ] = await Promise.all([
      User.countDocuments({}),
      Admin.countDocuments({}),
      Post.countDocuments({}),
      Event.countDocuments({}),
      Project.countDocuments({}),
    ]);

    // Optional: last 5 created items (nice for dashboard widgets)
    const [latestUsers, latestPosts, upcomingEvents] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email department year createdAt"),
      Post.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "name department")
        .select("content createdAt author"),
      Event.find({ date: { $gte: new Date() } })
        .sort({ date: 1 })
        .limit(5)
        .select("title date department location"),
    ]);

    res.json({
      totals: {
        users: totalUsers,
        admins: totalAdmins,
        posts: totalPosts,
        events: totalEvents,
        projects: totalProjects,
      },
      latestUsers,
      latestPosts,
      upcomingEvents,
    });
  } catch (err) {
    console.error("getAdminSummary error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
