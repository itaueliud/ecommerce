const Agent = require("../models/Agent");

const createAgent = async (req, res) => {
  try {
    const agent = await Agent.create({ ...req.body, user_id: req.user._id });
    res.status(201).json(agent);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().populate("user_id", "full_name email phone");
    res.json(agents);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).populate("user_id", "full_name email phone");
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createAgent, getAllAgents, getAgentById };
