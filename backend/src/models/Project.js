import mongoose from "mongoose"; 

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;