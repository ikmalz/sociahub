import Story from "../models/Story.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

export async function createStory(req, res) {
  try {
    console.log("=== CREATE STORY DEBUG ===");
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    console.log("User ID:", req.user.id);

    const userId = req.user.id;
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Media file is required for story",
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    let mediaType = "image";

    if (req.file.mimetype.startsWith("video/")) {
      mediaType = "video";
    }

    // Create story dengan expiresAt manual
    const story = await Story.create({
      user: userId,
      mediaUrl: fileUrl,
      mediaType,
      caption: caption || "",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      isActive: true,
    });

    // Populate user info
    const populatedStory = await Story.findById(story._id)
      .populate("user", "fullName profilePic")
      .lean();

    console.log("✅ Story created successfully:", populatedStory._id);
    console.log("Story expires at:", populatedStory.expiresAt);

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story: populatedStory,
    });
  } catch (error) {
    console.error("❌ Error in createStory:", error.message);
    console.error("Stack:", error.stack);
    console.error("Error details:", error.errors);

    if (req.file) {
      const filePath = path.join(process.cwd(), "uploads", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑️ Deleted file due to error:", filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function getTimelineStories(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("friends");
    const peopleToShow = [...user.friends, userId];

    const stories = await Story.find({
      user: { $in: peopleToShow },
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "fullName profilePic")
      .sort({ createdAt: -1 });

    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
          hasUnviewed: false,
        };
      }
      acc[userId].stories.push(story);

      // Check if user has viewed this story
      const hasViewed = story.views.some(
        (view) => view.user.toString() === userId
      );
      if (!hasViewed) {
        acc[userId].hasUnviewed = true;
      }

      return acc;
    }, {});

    const result = Object.values(groupedStories).map((group) => ({
      ...group,
      storyCount: group.stories.length,
    }));

    res.status(200).json({
      success: true,
      stories: result,
    });
  } catch (error) {
    console.error("Error in getTimelineStories:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getStory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(id)
      .populate("user", "fullName profilePic")
      .populate("views.user", "fullName profilePic");

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    const hasViewed = story.views.some(
      (view) => view.user._id.toString() === userId
    );

    if (!hasViewed) {
      story.views.push({ user: userId });
      await story.save();
    }

    res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    console.error("Error in getStory:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function deleteStory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    if (story.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own stories",
      });
    }

    const filename = story.mediaUrl.split("/").pop();
    const mediaPath = path.join(process.cwd(), "uploads", filename);

    if (fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath);
      console.log("🗑️ Deleted story media:", mediaPath);
    }

    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteStory:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function getMyStories(req, res) {
  try {
    const userId = req.user.id;

    const stories = await Story.find({
      user: userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("views.user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error("Error in getMyStories:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function markStoryAsViewed(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    const alreadyViewed = story.views.some(
      (view) => view.user.toString() === userId
    );

    if (!alreadyViewed) {
      story.views.push({ user: userId });
      await story.save();
    }

    res.status(200).json({
      success: true,
      message: "Story marked as viewed",
    });
  } catch (error) {
    console.error("Error in markStoryAsViewed:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const getStoryViewers = async (req, res) => {
  try {
    const storyId = req.params.id;

    const story = await Story.findById(storyId).populate(
      "views.user",
      "fullName profilePic"
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const filtered = story.views.filter(
      (v) => v.user && v.user._id.toString() !== story.user.toString()
    );

    const uniqueMap = new Map();
    filtered.forEach((view) => {
      uniqueMap.set(view.user._id.toString(), view);
    });

    const uniqueViews = Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(b.viewedAt) - new Date(a.viewedAt)
    );

    res.status(200).json(uniqueViews);
  } catch (error) {
    console.error("🔥 ERROR IN getStoryViewers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
