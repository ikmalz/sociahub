import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["client_note", "employee_note", "progress_update"],
      default: "client_note",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), 
      index: { expires: 0 }, 
    },
  },
  { timestamps: true }
);

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
    notes: [noteSchema],
    lastNote: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      note: String,
      createdAt: Date,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
