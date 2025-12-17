import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware", error);
    
    res.clearCookie("jwt");
    
    res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};

export const requireActive = (req, res, next) => {
  const allowedRoutesForInactive = [
    "/auth/onboarding",
    "/auth/logout",
    "/auth/me",
  ];

  if (!req.user.isActive && !allowedRoutesForInactive.includes(req.path)) {
    return res.status(403).json({
      message: "Account is not active. Please wait for admin approval.",
    });
  }
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("🔐 Checking role:", req.user?.role);
    console.log("🔐 Allowed roles:", allowedRoles);
    
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - No user found",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ Access denied. User role: ${req.user.role}, Required: ${allowedRoles}`);
      return res.status(403).json({
        message: "Access denied - insufficient permissions",
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }
    
    console.log("✅ Role check passed");
    next();
  };
};