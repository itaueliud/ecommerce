const express = require("express");
const router = express.Router();
const { createCustomer, getAllCustomers } = require("../controllers/miscControllers");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAllCustomers);
router.post("/", protect, createCustomer);

module.exports = router;
