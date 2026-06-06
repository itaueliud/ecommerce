const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  image:     { type: String, default: "" },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
