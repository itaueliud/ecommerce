const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  user_id:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer_type: { type: String, enum: ["retail", "hotel", "school", "hospital", "corporate", "event"], default: "retail" },
  business_name: { type: String },
  kra_pin:       { type: String },
  county:        { type: String },
  agent_id:      { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null }
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
