const Banner = require("../models/Banner");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Supplier = require("../models/Supplier");

// --- BANNER ---
const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ is_active: true });
    res.json(banners);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- NOTIFICATION ---
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
    res.json({ message: "Marked as read" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- ANALYTICS ---
const getDashboardAnalytics = async (req, res) => {
  try {
    const total_orders    = await Order.countDocuments();
    const total_customers = await Customer.countDocuments();
    const total_suppliers = await Supplier.countDocuments();
    const revenue         = await Order.aggregate([
      { $match: { payment_status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);
    res.json({
      total_orders,
      total_customers,
      total_suppliers,
      total_revenue: revenue[0]?.total || 0
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- USER ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password_hash");
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- CUSTOMER ---
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { user_id: req.user._id },
      { ...req.body, user_id: req.user._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(customer);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("user_id", "full_name email phone");
    res.json(customers);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  createBanner, getActiveBanners, deleteBanner,
  getMyNotifications, markAsRead,
  getDashboardAnalytics,
  getAllUsers, updateUser,
  createCustomer, getAllCustomers
};
