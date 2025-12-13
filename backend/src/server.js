import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from 'fs'; 
import { fileURLToPath } from "url"; 

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.routes.js";
import postRoutes from "./routes/post.route.js";
import storyRoutes from "./routes/story.route.js";

import { connectDB } from "./lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sociahub.vercel.app",
      /\.ngrok-free\.app$/,
    ],
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());

const uploadsDir = path.join(__dirname, "uploads");
console.log("📁 Uploads directory path:", uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

app.use("/uploads", express.static(uploadsDir));

app.get("/api/test-uploads", (req, res) => {
  const files = fs.readdirSync(uploadsDir);
  console.log("📂 Files in uploads:", files);
  res.json({ 
    uploadsPath: uploadsDir,
    files: files,
    absolutePath: path.resolve(uploadsDir)
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../../frontend/dist");

  console.log("🌐 Frontend dist path:", frontendDistPath);

  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📁 Uploads served from: ${uploadsDir}`);
  
  connectDB();
});