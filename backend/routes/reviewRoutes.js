const express = require("express");
const router = express.Router();
const { createReview, getSupplierReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);
router.get("/supplier/:supplierId", getSupplierReviews);

module.exports = router;
