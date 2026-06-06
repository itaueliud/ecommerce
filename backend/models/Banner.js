const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  link:      { type: String },
  position:  { type: String, enum: ["home_top", "home_middle", "category_page"], default: "home_top" },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);
