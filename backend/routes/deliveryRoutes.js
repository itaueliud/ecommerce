const express = require("express");
const router = express.Router();
const { createDelivery, getDeliveryByOrder, updateDeliveryStatus } = require("../controllers/deliveryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin"), createDelivery);
router.get("/order/:orderId", protect, getDeliveryByOrder);
router.put("/:id", protect, authorizeRoles("admin"), updateDeliveryStatus);

module.exports = router;
