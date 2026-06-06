// deliveryController.js
const Delivery = require("../models/Delivery");

const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.status(201).json(delivery);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getDeliveryByOrder = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ order_id: req.params.orderId }).populate("driver_id");
    res.json(delivery);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(delivery);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createDelivery, getDeliveryByOrder, updateDeliveryStatus };
