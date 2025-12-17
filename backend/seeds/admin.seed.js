import mongoose from "mongoose";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    fullName: "Super Admin",
    email: "admin@company.com",
    password: "admin123",
    role: "admin",
    isActive: true,
    approvalStatus: "approved",
    isOnBoarded: true,
  });

  console.log("Admin created successfully");
  process.exit();
};

createAdmin();
