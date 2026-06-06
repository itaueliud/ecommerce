const bcrypt = require("bcryptjs");
const Product = require("../models/Product");
const User = require("../models/User");
const Customer = require("../models/Customer");

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeProductPayload(body = {}) {
  const images = Array.isArray(body.images)
    ? body.images.filter(Boolean)
    : body.image
      ? [body.image]
      : [];

  const payload = {
    ...body,
    category: body.category || "",
    price: body.price !== undefined ? Number(body.price) : 0,
    oldPrice: body.oldPrice !== undefined && body.oldPrice !== "" ? Number(body.oldPrice) : undefined,
    stock_left: body.stock_left !== undefined && body.stock_left !== "" ? Number(body.stock_left) : 0,
    rating: body.rating !== undefined && body.rating !== "" ? Number(body.rating) : 4.5,
    image: body.image || images[0] || "",
    images,
    details: Array.isArray(body.details) ? body.details : body.details ? [body.details].flat() : []
  };

  if (!payload.slug && payload.name) {
    payload.slug = `${slugify(payload.name)}-${Date.now()}`;
  }

  return payload;
}

async function touchProductById(id, body, statusCode, res) {
  const product = await Product.findByIdAndUpdate(id, normalizeProductPayload(body), { new: true, runValidators: true });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.status(statusCode).json(product);
}

const listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password_hash")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true }).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User blocked", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { new: true }).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unblocked", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const newPassword = String(req.body.newPassword || "").trim();
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password_hash: hashed }, { new: true }).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Password reset successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const full_name = String(req.body.full_name || req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "").trim();

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone, and password are required" });
    }

    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res.status(400).json({ message: "Email or phone already in use" });
    }

    const user = await User.create({
      full_name,
      email,
      phone,
      password_hash: password,
      role: "admin",
      status: "active"
    });

    res.status(201).json({
      message: "Admin created",
      user: await User.findById(user._id).select("-password_hash")
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "customer") {
      await Customer.deleteMany({ user_id: user._id });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(normalizeProductPayload(req.body));
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    return touchProductById(req.params.id, req.body, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listUsers,
  blockUser,
  unblockUser,
  resetPassword,
  createAdmin,
  deleteUser,
  listProducts,
  createProduct,
  updateProduct
};
