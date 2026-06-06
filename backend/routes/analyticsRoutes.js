const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/miscControllers");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardAnalytics);

module.exports = router;
