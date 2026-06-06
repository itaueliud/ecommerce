const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  slug:          { type: String, required: true, unique: true },
  description:   { type: String },
  category:      { type: String },
  category_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subcategory_id:{ type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  brand:         { type: String },
  image:         { type: String },
  images:        [{ type: String }],
  price:         { type: Number, default: 0 },
  oldPrice:      { type: Number, default: 0 },
  rating:        { type: Number, default: 4.5 },
  stock_left:    { type: Number, default: 0 },
  offer_label:   { type: String },
  unit:          { type: String, enum: ["piece", "carton", "kg", "litre", "pack"], default: "piece" },
  unit_size:     { type: String },
  ingredients:   { type: String },
  details:       [{ type: String }],
  tags:          [{ type: String }],
  is_active:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
