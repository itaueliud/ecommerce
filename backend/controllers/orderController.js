const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Product = require("../models/Product");

const countyFees = {
  Nairobi: 250,
  Kiambu: 300,
  Machakos: 350,
  Kajiado: 350,
  Mombasa: 500,
  Nakuru: 450,
  Kisumu: 500,
  "Uasin Gishu": 550
};

async function getOrCreateCustomer(userId) {
  let customer = await Customer.findOne({ user_id: userId });
  if (!customer) {
    customer = await Customer.create({ user_id: userId });
  }
  return customer;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
}

function buildDeliveryAddress(address = {}, user = {}) {
  return {
    full_name: String(address.full_name || address.fullName || user.full_name || "").trim(),
    phone: String(address.phone || user.phone || "").trim(),
    county: String(address.county || "").trim(),
    town: String(address.town || "").trim(),
    details: String(address.details || "").trim()
  };
}

function canAccessOrder(req, order) {
  return req.user.role === "admin" || String(order.customer_id?.user_id || "") === String(req.user._id);
}

const createOrder = async (req, res) => {
  try {
    const requestedItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (requestedItems.length === 0) {
      return res.status(400).json({ message: "Order must include at least one item" });
    }

    const deliveryAddress = buildDeliveryAddress(req.body.delivery_address, req.user);
    if (!deliveryAddress.full_name || !deliveryAddress.phone || !deliveryAddress.county || !deliveryAddress.town || !deliveryAddress.details) {
      return res.status(400).json({ message: "Complete delivery address is required" });
    }

    const normalizedItems = requestedItems.map((item) => ({
      product_id: item.product_id || item._id,
      quantity: normalizeQuantity(item.quantity || item.qty)
    }));

    if (normalizedItems.some((item) => !mongoose.Types.ObjectId.isValid(item.product_id) || item.quantity <= 0)) {
      return res.status(400).json({ message: "Every order item must include a valid product and quantity" });
    }

    const productIds = [...new Set(normalizedItems.map((item) => String(item.product_id)))];
    const products = await Product.find({ _id: { $in: productIds }, is_active: true });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products are unavailable" });
    }

    const orderItems = normalizedItems.map((item) => {
      const product = productMap.get(String(item.product_id));
      if (product.stock_left < item.quantity) {
        throw new Error(`${product.name} only has ${product.stock_left} left in stock`);
      }

      const unitPrice = Number(product.price || 0);
      return {
        product_id: product._id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: unitPrice * item.quantity
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const delivery_fee = countyFees[deliveryAddress.county] || 600;
    const total_amount = subtotal + delivery_fee;
    const customer = await getOrCreateCustomer(req.user._id);

    const order = await Order.create({
      customer_id: customer._id,
      items: orderItems,
      delivery_address: deliveryAddress,
      subtotal,
      delivery_fee,
      total_amount,
      notes: String(req.body.notes || "").trim()
    });

    try {
      await Notification.create({
        user_id: req.user._id,
        title: "Order Placed",
        message: `Your order ${order.order_number} has been placed successfully.`,
        type: "order"
      });
    } catch (notificationError) {
      console.error(`Order notification failed for ${order._id}: ${notificationError.message}`);
    }

    const populatedOrder = await Order.findById(order._id).populate("items.product_id", "name images unit unit_size");
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({ path: "customer_id", populate: { path: "user_id", select: "full_name email phone" } })
      .populate("items.product_id", "name images unit unit_size")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({ path: "customer_id", populate: { path: "user_id", select: "full_name email phone" } })
      .populate("items.product_id", "name images unit unit_size");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canAccessOrder(req, order)) return res.status(403).json({ message: "Not authorized to view this order" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = ["pending", "confirmed", "sourcing", "collected", "in_transit", "delivered", "cancelled"];
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user_id: req.user._id });
    if (!customer) return res.json([]);

    const orders = await Order.find({ customer_id: customer._id })
      .populate("items.product_id", "name images unit unit_size")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, getMyOrders };
