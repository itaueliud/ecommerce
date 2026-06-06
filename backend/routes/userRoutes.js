const express = require("express");
const router = express.Router();
const { getAllUsers, updateUser } = require("../controllers/miscControllers");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id", protect, updateUser);

module.exports = router;
