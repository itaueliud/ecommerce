const express = require("express");
const router = express.Router();
const { createPayment, getPaymentByOrder, confirmPayment, mpesaCallback, initiateMpesaStkPush } = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.post("/mpesa/stkpush", protect, adminOnly, initiateMpesaStkPush);
router.post("/mpesa/callback", mpesaCallback);
router.get("/order/:orderId", protect, getPaymentByOrder);
router.put("/:id/confirm", protect, adminOnly, confirmPayment);

module.exports = router;
