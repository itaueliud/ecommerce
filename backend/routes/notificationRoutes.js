const express = require("express");
const router = express.Router();
const { getMyNotifications, markAsRead } = require("../controllers/miscControllers");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);

module.exports = router;
