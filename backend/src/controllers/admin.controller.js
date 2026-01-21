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

    try {
      await upsertStreamUser({
        id: user._id.toString(),
        delete: true, 
      });
    } catch (err) {
      console.log("⚠️ Stream delete skipped:", err.message);
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User rejected and permanently deleted",
    });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const assignEmployeeToClient = async (req, res) => {
  try {
    const { employeeIds, clientId } = req.body;

    if (!clientId || !employeeIds?.length) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const client = await User.findById(clientId);
    if (!client || client.role !== "client") {
      return res.status(400).json({ message: "Invalid client" });
    }

    const employees = await User.find({
      _id: { $in: employeeIds },
      role: "employee",
    });

    if (employees.length !== employeeIds.length) {
      return res
        .status(400)
        .json({ message: "One or more employees invalid" });
    }

    for (const emp of employees) {
      if (!emp.assignedClients.includes(clientId)) {
        emp.assignedClients.push(clientId);
        await emp.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Employees successfully assigned to client",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getClients = async (req, res) => {
  try {
    const clients = await User.find({
      role: "client",
      isActive: true,
      approvalStatus: "approved",
    }).select("fullName email institutionName");

    res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
      isActive: true,
      approvalStatus: "approved",
    }).select("fullName email skills expertise assignedClients");

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
