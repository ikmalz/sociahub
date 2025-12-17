import express from "express";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../controllers/admin.controller.js";
import { protectRoute, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/pending-users",
  protectRoute,
  requireRole("admin"),
  getPendingUsers
);

router.put("/approve/:userId", protectRoute, requireRole("admin"), approveUser);

router.put("/reject/:userId", protectRoute, requireRole("admin"), rejectUser);

export default router;
