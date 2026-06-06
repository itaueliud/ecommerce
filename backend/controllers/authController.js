const User = require("../models/User");
const Customer = require("../models/Customer");
const generateToken = require("../utils/generateToken");

const strongPasswordRules = [
  { label: "at least 8 characters", test: (value) => value.length >= 8 },
  { label: "one uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "one lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "one number", test: (value) => /\d/.test(value) },
  { label: "one special character", test: (value) => /[^A-Za-z0-9]/.test(value) }
];

function getMissingPasswordRules(value = "") {
  return strongPasswordRules.filter((rule) => !rule.test(value)).map((rule) => rule.label);
}

// @desc Register user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const full_name = req.body.full_name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const phone = req.body.phone?.trim();
    const password = req.body.password;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ message: "Full name, email, phone, and password are required" });
    }

    const missingPasswordRules = getMissingPasswordRules(password);
    if (missingPasswordRules.length > 0) {
      return res.status(400).json({
        message: `Password must include ${missingPasswordRules.join(", ")}`
      });
    }

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      const field = userExists.email === email ? "email" : "phone";
      return res.status(400).json({ message: `An account with that ${field} already exists` });
    }

    const user = await User.create({ full_name, email, phone, password_hash: password, role: "customer", status: "active" });
    const customer = await Customer.create({ user_id: user._id });

    res.status(201).json({
      message: "Customer account created. You are now signed in.",
      _id: user._id,
      customer_id: customer._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || "field";
      return res.status(400).json({ message: `An account with that ${field} already exists` });
    }

    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.blocked) {
        return res.status(403).json({ message: "Your account has been blocked" });
      }
      await User.findByIdAndUpdate(user._id, { last_login: new Date() });
      res.json({
        _id: user._id,
        customer_id: user.role === "customer" ? (await Customer.findOne({ user_id: user._id }))?._id : undefined,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged in user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
