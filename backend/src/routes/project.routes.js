import express from "express";
import {
  createProject,
  getAllowedEmployees,
  getMyProjects,
  updateProjectProgress,
} from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/allowed-employees", protectRoute, getAllowedEmployees);
router.post("/", protectRoute, createProject);
router.get("/my-projects", protectRoute, getMyProjects);
router.put("/:projectId/progress", protectRoute, updateProjectProgress);

export default router;
