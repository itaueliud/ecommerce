const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicle_type: { type: String, enum: ["motorbike", "van", "truck"], default: "motorbike" },
  plate_number: { type: String },
  county:       { type: String },
  is_available: { type: Boolean, default: true },
  rating:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);
