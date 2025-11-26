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

// GET /api/admin/users
// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, department, search } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/users/:id
// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/users/:id
// Update user by admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = ["name", "email", "department", "year", "bio", "interests"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("updateUserByAdmin error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
