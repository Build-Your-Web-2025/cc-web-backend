// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

// For student routes
export const userProtect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found or invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("userProtect error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// For admin routes
export const adminProtect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found or invalid token" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("adminProtect error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// For routes accessible by both users and admins
export const userOrAdminProtect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find as user first
    let user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.userType = "user";
      return next();
    }

    // If not user, try admin
    let admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      req.user = admin; // Set as user for compatibility
      req.userType = "admin";
      return next();
    }

    return res.status(401).json({ message: "User/Admin not found or invalid token" });
  } catch (err) {
    console.error("userOrAdminProtect error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
