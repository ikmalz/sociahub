import express from "express";
import {
  completeOnboarding,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; // Hapus requireActive

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/onboarding", protectRoute, completeOnboarding);
router.put("/update-profile", protectRoute, updateProfile);

router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;