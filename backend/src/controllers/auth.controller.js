import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, please use a different one" });
    }

    const seed = Math.random().toString(36).substring(7);
    const randomAvatar = `https://api.dicebear.com/7.x/adventurer/png?seed=${seed}`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
      role: "unassigned", 
      isActive: false,
      isOnBoarded: false,
      approvalStatus: "pending",
    });

    // JANGAN buat Stream user di sini - tunggu sampai di-approve
    // try {
    //   await upsertStreamUser({
    //     id: newUser._id.toString(),
    //     name: newUser.fullName,
    //     image: newUser.profilePic || "",
    //   });
    //   console.log(`Stream user created for ${newUser.fullName}`);
    // } catch (error) {
    //   console.log("Error creating Stream user:", error);
    // }

    // JANGAN BUAT TOKEN DI SINI! <<< INI MASALAH UTAMA
    // const token = jwt.sign(
    //   { userId: newUser._id },
    //   process.env.JWT_SECRET_KEY,
    //   {
    //     expiresIn: "7d",
    //   }
    // );

    // JANGAN SET COOKIE DI SINI! <<< INI MASALAH UTAMA
    // res.cookie("jwt", token, {
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: process.env.NODE_ENV === "production",
    // });

    res.status(201).json({ 
      success: true, 
      message: "Registration successful! Please wait for admin approval.",
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
        approvalStatus: newUser.approvalStatus,
        isActive: newUser.isActive
      }
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive || user.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "Account not active. Please wait for admin approval.",
        approvalStatus: user.approvalStatus 
      });
    }

    if (user.role === "unassigned" || !user.role) {
      return res.status(403).json({
        message: "Account not yet assigned a role. Please contact admin.",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successfull" });
}

export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      phoneNumber,
      department,
      position,
      bio,
      location,
      profilePic,
      expertise,
      skills,
      institutionName,    
      institutionType,    
      projectInterests,   
      governmentLevel,    
      employeeId,         
    } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "client") {
      if (!institutionName) {
        return res.status(400).json({ message: "Institution name is required for government clients" });
      }
    } else if (user.role === "employee") {
      if (!department) {
        return res.status(400).json({ message: "Department is required for employees" });
      }
      if (!position) {
        return res.status(400).json({ message: "Position is required for employees" });
      }
    } else {
      user.role = "employee";
      await user.save();
    }

    const updateData = {
      fullName,
      email: email || user.email,
      phoneNumber,
      bio,
      location,
      profilePic,
      expertise,
      isOnBoarded: true,
    };

    if (user.role === "client") {
      updateData.institutionName = institutionName;
      updateData.institutionType = institutionType || "";
      updateData.projectInterests = projectInterests || "";
      updateData.governmentLevel = governmentLevel || "";
      updateData.department = ""; 
      updateData.position = position || "";
      updateData.companyName = institutionName;
    } else if (user.role === "employee") {
      updateData.department = department;
      updateData.position = position;
      updateData.skills = skills || [];
      updateData.employeeId = employeeId || "";
      updateData.companyName = req.body.companyName || user.companyName || "";
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      { new: true, runValidators: true }
    ).select("-password");

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
    } catch (streamError) {
      console.log("Stream update error:", streamError.message);
    }

    res.status(200).json({
      message: "Onboarding completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in completeOnboarding:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      email,
      phoneNumber,
      department,
      position,
      bio,
      location,
      profilePic,
      expertise,
      skills,
      institutionName,
      institutionType,
      projectInterests,
      governmentLevel,
      employeeId,
      companyName,
    } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      fullName,
      email: email || user.email,
      phoneNumber,
      bio,
      location,
      profilePic,
      expertise,
    };

    if (user.role === "client") {
      updateData.institutionName = institutionName || user.institutionName;
      updateData.institutionType = institutionType || user.institutionType;
      updateData.projectInterests = projectInterests || user.projectInterests;
      updateData.governmentLevel = governmentLevel || user.governmentLevel;
      updateData.department = ""; 
      updateData.position = position || user.position;
      updateData.companyName = institutionName || user.companyName;
    } else if (user.role === "employee") {
      updateData.department = department || user.department;
      updateData.position = position || user.position;
      updateData.skills = skills || user.skills || [];
      updateData.employeeId = employeeId || user.employeeId;
      updateData.companyName = companyName || user.companyName;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (fullName !== user.fullName || profilePic !== user.profilePic) {
      try {
        await upsertStreamUser({
          id: updatedUser._id.toString(),
          name: updatedUser.fullName,
          image: updatedUser.profilePic || "",
        });
      } catch (streamError) {
        console.log("Stream update error:", streamError.message);
      }
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function checkApprovalStatus(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select(
      "email fullName approvalStatus isActive"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      status: user.approvalStatus,
      isActive: user.isActive,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in checkApprovalStatus:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
