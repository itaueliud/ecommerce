const express = require("express");
const router = express.Router();
const { createCustomer, getAllCustomers } = require("../controllers/miscControllers");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("admin"), getAllCustomers);
router.post("/", protect, createCustomer);

module.exports = router;
