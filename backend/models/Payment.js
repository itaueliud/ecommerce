const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order_id:        { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customer_id:     { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  amount:          { type: Number, required: true },
  method:          { type: String, enum: ["mpesa", "card", "bank", "cash_on_delivery"], default: "mpesa" },
  paybill_number:  { type: String },
  account_number:  { type: String },
  mpesa_code:      { type: String },
  mpesa_receipt:   { type: String },
  checkout_request_id: { type: String },
  merchant_request_id: { type: String },
  transaction_ref: { type: String },
  status:          { type: String, enum: ["pending", "success", "failed", "cancelled"], default: "pending" },
  callback_payload:{ type: mongoose.Schema.Types.Mixed },
  paid_at:         { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
