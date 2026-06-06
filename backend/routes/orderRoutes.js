const express = require("express");
const router = express.Router();
const { createOrder, createPosOrder, getAllOrders, getOrderById, updateOrderStatus, getMyOrders } = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAllOrders);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, createOrder);
router.post("/pos", protect, adminOnly, createPosOrder);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
