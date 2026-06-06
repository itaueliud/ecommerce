const express = require("express");
const router = express.Router();
const { createBanner, getActiveBanners, deleteBanner } = require("../controllers/miscControllers");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getActiveBanners);
router.post("/", protect, adminOnly, createBanner);
router.delete("/:id", protect, adminOnly, deleteBanner);

module.exports = router;
