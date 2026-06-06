const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  full_name:       { type: String, required: true },
  email:           { type: String, required: true, unique: true },
  phone:           { type: String, required: true, unique: true },
  password_hash:   { type: String, required: true },
  role:            { type: String, enum: ["customer", "supplier", "agent", "admin"], default: "customer" },
  status:          { type: String, enum: ["active", "suspended", "pending"], default: "pending" },
  profile_picture: { type: String, default: "" },
  last_login:      { type: Date }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model("User", userSchema);
