// controllers/commentController.js
import Comment from "../models/Comment.js";

//
// GET /api/posts/:postId/comments
//
export const getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const rawComments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .lean(); // oldest first

    const Admin = (await import("../models/Admin.js")).default;
    const User = (await import("../models/User.js")).default;

    // Manually populate each comment's author from User or Admin
    const populatedComments = await Promise.all(
      rawComments.map(async (comment) => {
        let authorData = null;

        // Try User first
        authorData = await User.findById(comment.author).select("name department year avatarUrl").lean();

        // If not found in User, try Admin
        if (!authorData) {
          const adminData = await Admin.findById(comment.author).select("name department designation").lean();
          if (adminData) {
            authorData = {
              _id: adminData._id,
              name: adminData.name,
              department: adminData.department,
            };
          }
        }

        return {
          ...comment,
          author: authorData,
        };
      })
    );

    res.json(populatedComments);
  } catch (err) {
    console.error("getCommentsForPost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// POST /api/posts/:postId/comments
//
export const addCommentToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      text: text.trim(),
    });

    let commentData = comment.toObject();

    // Check if author is admin or user
    if (req.userType === "admin") {
      const Admin = (await import("../models/Admin.js")).default;
      const adminAuthor = await Admin.findById(req.user._id).select("name department designation");
      if (adminAuthor) {
        commentData.author = {
          _id: adminAuthor._id,
          name: adminAuthor.name,
          department: adminAuthor.department,
        };
      }
    } else {
      const User = (await import("../models/User.js")).default;
      const userAuthor = await User.findById(req.user._id).select("name department year avatarUrl");
      if (userAuthor) {
        commentData.author = userAuthor;
      }
    }

    res.status(201).json(commentData);
  } catch (err) {
    console.error("addCommentToPost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
