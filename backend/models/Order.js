const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  supplier_product_id: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierProduct" },
  product_id:          { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  supplier_id:         { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  quantity:            { type: Number, required: true },
  unit_price:          { type: Number, required: true },
  subtotal:            { type: Number, required: true }
});

const deliveryAddressSchema = new mongoose.Schema({
  full_name: { type: String },
  phone:     { type: String },
  county:    { type: String },
  town:      { type: String },
  details:   { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_number:       { type: String, unique: true },
  customer_id:        { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items:              [orderItemSchema],
  delivery_address_id:{ type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  delivery_address:   deliveryAddressSchema,
  status:             { type: String, enum: ["pending", "confirmed", "sourcing", "collected", "in_transit", "delivered", "cancelled"], default: "pending" },
  payment_status:     { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
  inventory_deducted: { type: Boolean, default: false },
  subtotal:           { type: Number, default: 0 },
  delivery_fee:       { type: Number, default: 0 },
  total_amount:       { type: Number, default: 0 },
  notes:              { type: String }
}, { timestamps: true });

orderSchema.pre("save", function (next) {
  if (!this.order_number) {
    this.order_number = "ORD-" + Date.now();
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
