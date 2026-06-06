const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  label:      { type: String, enum: ["home", "office", "other"], default: "home" },
  county:     { type: String, required: true },
  sub_county: { type: String },
  town:       { type: String },
  street:     { type: String },
  building:   { type: String },
  latitude:   { type: Number, default: 0 },
  longitude:  { type: Number, default: 0 },
  is_default: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);
