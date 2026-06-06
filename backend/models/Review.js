const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  order_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  rating:      { type: Number, min: 1, max: 5, required: true },
  comment:     { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
