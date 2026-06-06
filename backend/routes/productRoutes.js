const express = require("express");
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, superAdminOnly, createProduct);
router.put("/:id", protect, superAdminOnly, updateProduct);
router.delete("/:id", protect, superAdminOnly, deleteProduct);

module.exports = router;
