const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  order_id:             { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  driver_id:            { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  county:               { type: String },
  pickup_location:      { type: String },
  delivery_address:     { type: String },
  status:               { type: String, enum: ["scheduled", "picked_up", "in_transit", "delivered", "failed"], default: "scheduled" },
  estimated_time:       { type: String },
  delivered_at:         { type: Date },
  delivery_proof_image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Delivery", deliverySchema);
