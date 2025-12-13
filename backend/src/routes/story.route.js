// routes/story.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  createStory,
  deleteStory,
  getStory,
  getTimelineStories,
  getMyStories,
  markStoryAsViewed,
  getStoryViewers,
} from "../controllers/story.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getTimelineStories);
router.get("/my", getMyStories);
router.get("/:id/viewers", getStoryViewers);
router.get("/:id", getStory);
router.post("/", upload.single("media"), createStory);
router.delete("/:id", deleteStory);
router.post("/:id/view", markStoryAsViewed);

export default router;