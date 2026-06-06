const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/miscControllers");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, adminOnly, getDashboardAnalytics);

module.exports = router;
