const express = require("express");
const router = express.Router();
const { createCategory, getAllCategories, getSubcategories } = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllCategories);
router.get("/:id/subcategories", getSubcategories);
router.post("/", protect, adminOnly, createCategory);

module.exports = router;
