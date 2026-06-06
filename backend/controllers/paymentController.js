const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");

function mpesaPaybill() {
  return {
    paybill_number: process.env.MPESA_PAYBILL_NUMBER || "247247",
    account_number: process.env.MPESA_ACCOUNT_NUMBER || "0710292540"
  };
}

async function getOwnedOrder(req, orderId) {
  const order = await Order.findById(orderId).populate("customer_id");
  if (!order) return null;

  const isAdmin = req.user.role === "admin";
  const isOwner = String(order.customer_id?.user_id || "") === String(req.user._id);
  return isAdmin || isOwner ? order : false;
}

function extractMpesaCallback(body = {}) {
  const callback = body.Body?.stkCallback || body.stkCallback || body;
  const metadata = callback.CallbackMetadata?.Item || callback.callbackMetadata?.Item || [];
  const byName = new Map(metadata.map((item) => [item.Name, item.Value]));

  return {
    checkout_request_id: callback.CheckoutRequestID || callback.checkout_request_id,
    merchant_request_id: callback.MerchantRequestID || callback.merchant_request_id,
    result_code: Number(callback.ResultCode ?? callback.result_code ?? 0),
    result_description: callback.ResultDesc || callback.result_description,
    amount: byName.get("Amount"),
    mpesa_receipt: byName.get("MpesaReceiptNumber"),
    transaction_date: byName.get("TransactionDate"),
    phone: byName.get("PhoneNumber")
  };
}

async function deductInventoryForPaidOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.inventory_deducted) return order;

  const decrementedItems = [];
  for (const item of order.items) {
    const stockUpdate = await Product.updateOne(
      { _id: item.product_id, stock_left: { $gte: item.quantity } },
      { $inc: { stock_left: -item.quantity } }
    );

    if (stockUpdate.modifiedCount !== 1) {
      if (decrementedItems.length > 0) {
        await Product.bulkWrite(decrementedItems.map((decrementedItem) => ({
          updateOne: {
            filter: { _id: decrementedItem.product_id },
            update: { $inc: { stock_left: decrementedItem.quantity } }
          }
        })));
      }
      throw new Error("Not enough stock to approve this payment. Review the order before confirming.");
    }

    decrementedItems.push({
      product_id: item.product_id,
      quantity: item.quantity
    });
  }

  order.inventory_deducted = true;
  await order.save();
  return order;
}

const createPayment = async (req, res) => {
  try {
    const { order_id, method = "mpesa", checkout_request_id, merchant_request_id } = req.body;
    if (!order_id) return res.status(400).json({ message: "Order is required for payment" });

    const order = await getOwnedOrder(req, order_id);
    if (order === false) return res.status(403).json({ message: "Not authorized to pay for this order" });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.payment_status === "paid") return res.status(400).json({ message: "Order is already paid" });

    const allowedMethods = ["mpesa", "cash_on_delivery"];
    if (!allowedMethods.includes(method)) {
      return res.status(400).json({ message: "Unsupported payment method" });
    }

    const paymentDetails = {
      order_id: order._id,
      customer_id: order.customer_id._id,
      amount: order.total_amount,
      method,
      status: method === "cash_on_delivery" ? "pending" : "pending",
      checkout_request_id,
      merchant_request_id,
      ...(method === "mpesa" ? mpesaPaybill() : {})
    };

    const payment = await Payment.create(paymentDetails);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentByOrder = async (req, res) => {
  try {
    const order = await getOwnedOrder(req, req.params.orderId);
    if (order === false) return res.status(403).json({ message: "Not authorized to view this payment" });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const payment = await Payment.findOne({ order_id: order._id }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { mpesa_code, transaction_ref } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    await deductInventoryForPaidOrder(payment.order_id);

    payment.status = "success";
    payment.mpesa_code = mpesa_code || payment.mpesa_code;
    payment.transaction_ref = transaction_ref || payment.transaction_ref;
    payment.paid_at = new Date();
    await payment.save();

    await Order.findByIdAndUpdate(payment.order_id, { payment_status: "paid", status: "confirmed", inventory_deducted: true });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mpesaCallback = async (req, res) => {
  try {
    const callbackSecret = process.env.MPESA_CALLBACK_SECRET;
    if (callbackSecret && req.get("X-Mpesa-Callback-Secret") !== callbackSecret) {
      return res.status(401).json({ message: "Invalid callback secret" });
    }

    const callback = extractMpesaCallback(req.body);
    const payment = await Payment.findOne({
      $or: [
        { checkout_request_id: callback.checkout_request_id },
        { merchant_request_id: callback.merchant_request_id }
      ].filter((query) => Object.values(query)[0])
    }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found for callback" });
    }

    payment.callback_payload = req.body;
    payment.checkout_request_id = callback.checkout_request_id || payment.checkout_request_id;
    payment.merchant_request_id = callback.merchant_request_id || payment.merchant_request_id;

    if (callback.result_code === 0) {
      await deductInventoryForPaidOrder(payment.order_id);
      payment.status = "success";
      payment.mpesa_receipt = callback.mpesa_receipt;
      payment.mpesa_code = callback.mpesa_receipt;
      payment.paid_at = new Date();
      await Order.findByIdAndUpdate(payment.order_id, { payment_status: "paid", status: "confirmed", inventory_deducted: true });
    } else {
      payment.status = "failed";
    }

    await payment.save();
    res.json({ message: "Callback processed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPayment, getPaymentByOrder, confirmPayment, mpesaCallback };
