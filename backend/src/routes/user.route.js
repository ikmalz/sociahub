import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getAllUsers,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserById,
  sendFriendRequest,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getRecommendedUsers);

router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.get("/:id", getUserById);
router.get("/all", getAllUsers);

export default router;
