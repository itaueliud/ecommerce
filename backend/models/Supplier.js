const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  user_id:              { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  business_name:        { type: String, required: true },
  business_type:        { type: String, enum: ["manufacturer", "distributor", "wholesaler", "stockist"], required: true },
  kra_pin:              { type: String },
  business_reg_number:  { type: String },
  county:               { type: String, required: true },
  town:                 { type: String },
  phone:                { type: String },
  email:                { type: String },
  logo:                 { type: String, default: "" },
  is_verified:          { type: Boolean, default: false },
  subscription_package: { type: String, enum: ["free", "basic", "premium"], default: "free" },
  rating:               { type: Number, default: 0 },
  total_reviews:        { type: Number, default: 0 },
  status:               { type: String, enum: ["active", "suspended", "pending"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);
