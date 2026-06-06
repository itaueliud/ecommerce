const express = require("express");
const router = express.Router();
const { createAgent, getAllAgents, getAgentById } = require("../controllers/agentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("admin"), getAllAgents);
router.get("/:id", protect, getAgentById);
router.post("/", protect, createAgent);

module.exports = router;
