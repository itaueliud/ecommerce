const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  slug:          { type: String, required: true, unique: true },
  description:   { type: String },
  category_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory_id:{ type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  brand:         { type: String },
  images:        [{ type: String }],
  price:         { type: Number, default: 0 },
  oldPrice:      { type: Number, default: 0 },
  stock_left:    { type: Number, default: 0 },
  unit:          { type: String, enum: ["piece", "carton", "kg", "litre", "pack"], default: "piece" },
  unit_size:     { type: String },
  tags:          [{ type: String }],
  is_active:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
