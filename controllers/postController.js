// controllers/postController.js
import Post from "../models/Post.js";

//
// GET /api/posts
// query: ?tag=xyz&author=userid&project=projectId
//
export const getPosts = async (req, res) => {
  try {
    const { tag, author, project } = req.query;
    const filter = {};

    if (tag) filter.tags = { $in: [tag] };
    if (author) filter.author = author;
    if (project) filter.project = project;

    // Get posts without population first to preserve author IDs
    const rawPosts = await Post.find(filter).sort({ createdAt: -1 }).lean();

    const Admin = (await import("../models/Admin.js")).default;
    const User = (await import("../models/User.js")).default;

    // Manually populate each post's author from User or Admin
    const populatedPosts = await Promise.all(
      rawPosts.map(async (post) => {
        let authorData = null;

        // Try User first
        authorData = await User.findById(post.author).select("name department year avatarUrl").lean();

        // If not found in User, try Admin
        if (!authorData) {
          const adminData = await Admin.findById(post.author).select("name department designation").lean();
          if (adminData) {
            authorData = {
              _id: adminData._id,
              name: adminData.name,
              department: adminData.department,
            };
          }
        }

        return {
          ...post,
          author: authorData,
        };
      })
    );

    res.json({ message: "Posts Fetched Successfully", posts: populatedPosts });
  } catch (err) {
    console.error("getPosts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// POST /api/posts
//
export const createPost = async (req, res) => {
  try {
    const { content, imageUrl, tags, project } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      imageUrl: imageUrl || null,
      tags: tags || [],
      project: project || null,
    });

    let postData = post.toObject();

    // Check if author is admin or user
    if (req.userType === "admin") {
      const Admin = (await import("../models/Admin.js")).default;
      const adminAuthor = await Admin.findById(req.user._id).select("name department designation");
      if (adminAuthor) {
        postData.author = {
          _id: adminAuthor._id,
          name: adminAuthor.name,
          department: adminAuthor.department,
          designation: adminAuthor.designation,
        };
      }
    } else {
      const User = (await import("../models/User.js")).default;
      const userAuthor = await User.findById(req.user._id).select("name department year avatarUrl");
      if (userAuthor) {
        postData.author = userAuthor;
      }
    }

    res.status(201).json(postData);
  } catch (err) {
    console.error("createPost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// GET /api/posts/:id
//
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) return res.status(404).json({ message: "Post not found" });

    const Admin = (await import("../models/Admin.js")).default;
    const User = (await import("../models/User.js")).default;

    // Try to populate author from User first, then Admin
    let authorData = await User.findById(post.author).select("name department year avatarUrl").lean();

    if (!authorData) {
      const adminData = await Admin.findById(post.author).select("name department designation").lean();
      if (adminData) {
        authorData = {
          _id: adminData._id,
          name: adminData.name,
          department: adminData.department,
        };
      }
    }

    res.json({ ...post, author: authorData });
  } catch (err) {
    console.error("getPostById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// POST /api/posts/:id/like
// toggles like/unlike
//
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Unliked post" : "Liked post",
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error("toggleLikePost error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
