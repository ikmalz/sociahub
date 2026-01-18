import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, default: "" },
    
    imageUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    
    location: {
      name: { type: String, default: null },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    eventDate: { type: Date, default: null },
    mood: { type: String, default: null }, 
    
    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;