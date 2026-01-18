import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: String,
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    createdBy: {
      type: String,
      enum: ["admin", "employee"],
      default: "admin",
    },
    notes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;