const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password_hash");
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      if (req.user.blocked) {
        return res.status(403).json({ message: "Your account has been blocked" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
    }
    next();
  };
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "superadmin") return next();
  return res.status(403).json({ message: "Admin access required" });
};

const superAdminOnly = (req, res, next) => {
  if (req.user?.role === "superadmin") return next();
  return res.status(403).json({ message: "Superadmin access required" });
};

module.exports = { protect, authorizeRoles, adminOnly, superAdminOnly };
