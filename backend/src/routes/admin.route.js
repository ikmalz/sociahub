import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  createTask,
  updateTask,
  assignTaskToEmployee,
} from "../controllers/project.controller.js";

import {
  getPendingUsers,
  approveUser,
  rejectUser,
  assignEmployeeToClient,
  getClients,
  getEmployees
} from "../controllers/admin.controller.js";

import { protectRoute, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/pending-users", protectRoute, requireRole("admin"), getPendingUsers);
router.put("/approve/:userId", protectRoute, requireRole("admin"), approveUser);
router.put("/reject/:userId", protectRoute, requireRole("admin"), rejectUser);
router.post("/assign-employee", protectRoute, requireRole("admin"), assignEmployeeToClient);
router.get("/clients", protectRoute, requireRole("admin"), getClients);
router.get("/employees", protectRoute, requireRole("admin"), getEmployees);

router.get("/projects", protectRoute, requireRole("admin"), getProjects);
router.post("/projects", protectRoute, requireRole("admin"), createProject);
router.get("/projects/:projectId", protectRoute, requireRole("admin"), getProjectById);
router.put("/projects/:projectId", protectRoute, requireRole("admin"), updateProject);
router.delete("/projects/:projectId", protectRoute, requireRole("admin"), deleteProject);

router.post("/tasks", protectRoute, requireRole("admin"), createTask);
router.put("/tasks/:taskId", protectRoute, requireRole("admin"), updateTask);
router.put("/tasks/:taskId/assign", protectRoute, requireRole("admin"), assignTaskToEmployee);

export default router;