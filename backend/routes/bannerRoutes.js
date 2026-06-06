const express = require("express");
const router = express.Router();
const { createBanner, getActiveBanners, deleteBanner } = require("../controllers/miscControllers");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getActiveBanners);
router.post("/", protect, authorizeRoles("admin"), createBanner);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBanner);

module.exports = router;
