const express = require("express");
const router = express.Router();
const { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier } = require("../controllers/supplierController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getAllSuppliers);
router.get("/:id", getSupplierById);
router.post("/", protect, createSupplier);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSupplier);

module.exports = router;
