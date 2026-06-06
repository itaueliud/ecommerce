const express = require("express");
const router = express.Router();
const { getAllUsers, updateUser } = require("../controllers/miscControllers");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.put("/:id", protect, updateUser);

module.exports = router;
