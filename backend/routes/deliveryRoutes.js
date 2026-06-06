const express = require("express");
const router = express.Router();
const { createDelivery, getDeliveryByOrder, updateDeliveryStatus } = require("../controllers/deliveryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, createDelivery);
router.get("/order/:orderId", protect, getDeliveryByOrder);
router.put("/:id", protect, adminOnly, updateDeliveryStatus);

module.exports = router;
