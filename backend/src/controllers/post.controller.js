import Post from "../models/Post.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

export async function createPost(req, res) {
  try {
    console.log("=== CREATE POST DEBUG ===");
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    console.log("User ID:", req.user.id);
    
    const userId = req.user.id;
    const { content, locationName, lat, lng, eventDate, mood } = req.body;

    let fileUrl = null;
    let fileType = null;

    if (req.file) {
      console.log("📁 File detected:", req.file);
      fileUrl = `/uploads/${req.file.filename}`;
      console.log("📂 File URL:", fileUrl);

      if (req.file.mimetype.startsWith("image/")) {
        fileType = "image";
      } else if (req.file.mimetype.startsWith("video/")) {
        fileType = "video";
      }
    }

    if (!content?.trim() && !req.file) {
      return res.status(400).json({ 
        message: "Post must have content or media" 
      });
    }

    const location = locationName ? {
      name: locationName,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null
    } : null;

    const parsedEventDate = eventDate ? new Date(eventDate) : null;

    const post = await Post.create({
      user: userId,
      content: content || "",
      imageUrl: fileType === "image" ? fileUrl : null,
      videoUrl: fileType === "video" ? fileUrl : null,
      location: location,
      eventDate: parsedEventDate,
      mood: mood || null,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "fullName profilePic")
      .lean();

    console.log("✅ Post created successfully:", populatedPost._id);
    
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost
    });
    
  } catch (error) {
    console.error("❌ Error in createPost:", error.message);
    console.error("Stack:", error.stack);

    if (req.file) {
      const filePath = path.join(
        process.cwd(), 
        'uploads', 
        req.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑️ Deleted file due to error:", filePath);
      }
    }

    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    
    console.log("=== DELETE POST DEBUG ===");
    console.log("Post ID to delete:", id);
    console.log("User ID from token:", req.user.id);
    
    const post = await Post.findById(id);
    
    if (!post) {
      console.log("Post not found");
      return res.status(404).json({ message: "Post not found" });
    }
    
    console.log("Found post:", {
      id: post._id,
      userId: post.user,
      content: post.content
    });
    console.log("Post user toString:", post.user.toString());
    console.log("User ID from token toString:", req.user.id.toString());
    console.log("Can delete?", post.user.toString() === req.user.id.toString());
    
    if (post.user.toString() !== req.user.id.toString()) {
      console.log("User not authorized to delete this post");
      return res.status(403).json({ 
        message: "You cannot delete this post",
        postUserId: post.user.toString(),
        currentUserId: req.user.id.toString()
      });
    }

    if (post.imageUrl) {
      const filename = post.imageUrl.split('/').pop();
      const imagePath = path.join(process.cwd(), 'uploads', filename);
      console.log("Image path to delete:", imagePath);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image file deleted");
      }
    }
    
    if (post.videoUrl) {
      const filename = post.videoUrl.split('/').pop();
      const videoPath = path.join(process.cwd(), 'uploads', filename);
      console.log("Video path to delete:", videoPath);
      
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log("Video file deleted");
      }
    }

    await post.deleteOne();
    console.log("Post deleted from database");

    res.status(200).json({ 
      message: "Post deleted successfully",
      postId: id 
    });
  } catch (error) {
    console.error("Error in deletePost:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
}

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, locationName, lat, lng, eventDate, mood, removeMedia } = req.body;

    console.log("=== UPDATE POST DEBUG ===");
    console.log("Post ID:", id);
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    console.log("Remove Media:", removeMedia);

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You cannot edit this post" });
    }

    let fileUrl = null;
    let fileType = null;
    let oldMediaPath = null;

    if (removeMedia === "true") {
      if (post.imageUrl) {
        oldMediaPath = path.join(process.cwd(), 'uploads', post.imageUrl.split('/').pop());
      } else if (post.videoUrl) {
        oldMediaPath = path.join(process.cwd(), 'uploads', post.videoUrl.split('/').pop());
      }
    }

    if (req.file) {
      if (post.imageUrl) {
        const oldImagePath = path.join(process.cwd(), 'uploads', post.imageUrl.split('/').pop());
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("🗑️ Deleted old image:", oldImagePath);
        }
      } else if (post.videoUrl) {
        const oldVideoPath = path.join(process.cwd(), 'uploads', post.videoUrl.split('/').pop());
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
          console.log("🗑️ Deleted old video:", oldVideoPath);
        }
      }

      fileUrl = `/uploads/${req.file.filename}`;
      
      if (req.file.mimetype.startsWith("image/")) {
        fileType = "image";
      } else if (req.file.mimetype.startsWith("video/")) {
        fileType = "video";
      }
    }

    const location = locationName ? {
      name: locationName,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null
    } : null;

    const parsedEventDate = eventDate ? new Date(eventDate) : null;

    const updateData = {
      content: content || "",
      mood: mood || null,
      ...(location && { location }),
      ...(parsedEventDate && { eventDate: parsedEventDate }),
    };

    if (removeMedia === "true") {
      updateData.imageUrl = null;
      updateData.videoUrl = null;
    } else if (fileType === "image") {
      updateData.imageUrl = fileUrl;
      updateData.videoUrl = null;
    } else if (fileType === "video") {
      updateData.videoUrl = fileUrl;
      updateData.imageUrl = null;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "fullName profilePic");

    if (oldMediaPath && fs.existsSync(oldMediaPath)) {
      fs.unlinkSync(oldMediaPath);
      console.log("🗑️ Deleted media file:", oldMediaPath);
    }

    console.log("✅ Post updated successfully:", updatedPost._id);
    
    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost
    });
    
  } catch (error) {
    console.error("❌ Error in updatePost:", error.message);
    console.error("Stack:", error.stack);

    if (req.file) {
      const filePath = path.join(
        process.cwd(), 
        'uploads', 
        req.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑️ Deleted new file due to error:", filePath);
      }
    }

    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find()
      .populate("user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getAllPosts", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getTimeline(req, res) {
  try {
    const user = await User.findById(req.user.id).select("friends");

    const peopleToShow = [...user.friends, req.user.id];

    const posts = await Post.find({ user: { $in: peopleToShow } })
      .populate("user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getTimeline", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyPosts(req, res) {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getMyPosts", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function likePostToggle(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(postId).populate(
      "user",
      "fullName profilePic"
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error in likePostToggle:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}