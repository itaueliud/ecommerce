const express = require("express");
const router = express.Router();
const { createAgent, getAllAgents, getAgentById } = require("../controllers/agentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getAllAgents);
router.get("/:id", protect, getAgentById);
router.post("/", protect, createAgent);

module.exports = router;
