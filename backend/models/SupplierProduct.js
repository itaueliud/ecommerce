const mongoose = require("mongoose");

const supplierProductSchema = new mongoose.Schema({
  supplier_id:        { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  product_id:         { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  price:              { type: Number, required: true },
  stock_quantity:     { type: Number, default: 0 },
  min_order_quantity: { type: Number, default: 1 },
  is_available:       { type: Boolean, default: true },
  is_featured:        { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("SupplierProduct", supplierProductSchema);
