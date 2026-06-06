const express = require("express");
const router = express.Router();
const { createCategory, getAllCategories, getSubcategories } = require("../controllers/categoryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getAllCategories);
router.get("/:id/subcategories", getSubcategories);
router.post("/", protect, authorizeRoles("admin"), createCategory);

module.exports = router;
