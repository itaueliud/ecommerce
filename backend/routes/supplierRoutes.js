const express = require("express");
const router = express.Router();
const { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier } = require("../controllers/supplierController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllSuppliers);
router.get("/:id", getSupplierById);
router.post("/", protect, createSupplier);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, adminOnly, deleteSupplier);

module.exports = router;
