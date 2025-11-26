// controllers/userAuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/user/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, department, year, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      department,
      year,
      interests: interests || [],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
      },
    });
  } catch (err) {
    console.error("registerUser error:", err);

    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/user/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/user/me
export const getUserMe = async (req, res) => {
  // userProtect already loaded req.user
  res.json(req.user);
};
