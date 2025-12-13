import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    caption: {
      type: String,
      default: "",
      maxlength: 2200,
    },
    views: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: function() {
        // Set default to 24 hours from now
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      },
      index: { expires: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// HAPUS pre("save") hook karena sudah menggunakan default function
// storySchema.pre("save", function (next) {
//   if (!this.expiresAt) {
//     this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
//   }
//   next();
// });

const Story = mongoose.model("Story", storySchema);
export default Story;