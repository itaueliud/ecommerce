const express = require("express");
const router = express.Router();
const { createPayment, getPaymentByOrder, confirmPayment, mpesaCallback } = require("../controllers/paymentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.post("/mpesa/callback", mpesaCallback);
router.get("/order/:orderId", protect, getPaymentByOrder);
router.put("/:id/confirm", protect, authorizeRoles("admin"), confirmPayment);

module.exports = router;
