const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  user_id:                    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agent_type:                 { type: String, enum: ["supplier_agent", "customer_agent"], required: true },
  county:                     { type: String },
  referral_code:              { type: String, unique: true },
  total_suppliers_registered: { type: Number, default: 0 },
  total_customers_registered: { type: Number, default: 0 },
  total_commission_earned:    { type: Number, default: 0 },
  status:                     { type: String, enum: ["active", "suspended"], default: "active" }
}, { timestamps: true });

agentSchema.pre("save", function (next) {
  if (!this.referral_code) {
    this.referral_code = "AGT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Agent", agentSchema);
