// routes/post.route.js
import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createPost,
  getTimeline,
  getMyPosts,
  deletePost, 
  getAllPosts,
  likePostToggle,
  updatePost,
} from "../controllers/post.controller.js"; 
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllPosts);
router.post("/", protectRoute, upload.single("image"), createPost);
router.get("/timeline", protectRoute, getTimeline);
router.get("/me", protectRoute, getMyPosts);
router.delete("/:id", protectRoute, deletePost); 
router.put("/like/:id", protectRoute, likePostToggle);
router.put("/:id", protectRoute, upload.single("image"), updatePost);

export default router;