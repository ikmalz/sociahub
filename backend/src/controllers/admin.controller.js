import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

const ALLOWED_ROLES = ["client", "employee"];

export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      approvalStatus: "pending",
      isActive: false
    }).select("-password");

    res.status(200).json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ 
        message: "Role is required (client or employee)" 
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role. Allowed: client, employee" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.approvalStatus !== "pending") {
      return res.status(400).json({
        message: "User has already been processed",
      });
    }

    user.isActive = true;
    user.approvalStatus = "approved";
    user.role = role;

    // Create Stream user
    await upsertStreamUser({
      id: user._id.toString(),
      name: user.fullName,
      image: user.profilePic || "",
    });

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: `User approved as ${role} successfully`,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.approvalStatus !== "pending") {
      return res.status(400).json({
        message: "User has already been processed",
      });
    }

    user.approvalStatus = "rejected";
    user.isActive = false;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: "User rejected successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};