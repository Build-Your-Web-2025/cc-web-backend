// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorMiddleware.js";

import authUserRoutes from "./routes/authUserRoutes.js";
import authAdminRoutes from "./routes/authAdminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CampusConnect API running" });
});

// Auth
app.use("/api/auth/user", authUserRoutes);
app.use("/api/auth/admin", authAdminRoutes);

// Users
app.use("/api/users", userRoutes);

// Posts & comments
app.use("/api/posts", postRoutes);                      
app.use("/api/posts/:postId/comments", commentRoutes);  


app.use("/api/events", eventRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);


// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CampusConnect backend running on port ${PORT}`);
});
