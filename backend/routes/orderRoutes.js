const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, getMyOrders } = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, createOrder);
router.put("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
