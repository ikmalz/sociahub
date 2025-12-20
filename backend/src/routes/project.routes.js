import express from "express";
import {
  addProjectNote,
  addTaskNote,
  createProject,
  deleteProjectNote,
  getAllowedEmployees,
  getMyProjects,
  getProjectNotes,
  getTaskNotes,
  updateProjectProgress,
  getProjects,
  markProjectAsCompleted,
} from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getProjects);

router.get("/allowed-employees", protectRoute, getAllowedEmployees);
router.post("/", protectRoute, createProject);

router.get("/my-projects", protectRoute, getMyProjects);
router.put("/:projectId/progress", protectRoute, updateProjectProgress);

router.post("/:projectId/notes", protectRoute, addProjectNote);
router.get("/:projectId/notes", protectRoute, getProjectNotes);
router.post("/tasks/:taskId/notes", protectRoute, addTaskNote);
router.get("/tasks/:taskId/notes", protectRoute, getTaskNotes);
router.delete("/:projectId/notes/:noteId", protectRoute, deleteProjectNote);
router.patch("/:projectId/complete", protectRoute, markProjectAsCompleted);

export default router;