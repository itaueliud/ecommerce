const express = require("express");
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorizeRoles("admin", "supplier"), createProduct);
router.put("/:id", protect, authorizeRoles("admin", "supplier"), updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

module.exports = router;
