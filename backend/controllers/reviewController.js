const Review = require("../models/Review");
const Supplier = require("../models/Supplier");

const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    const reviews = await Review.find({ supplier_id: req.body.supplier_id });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Supplier.findByIdAndUpdate(req.body.supplier_id, { rating: avgRating.toFixed(1), total_reviews: reviews.length });
    res.status(201).json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getSupplierReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ supplier_id: req.params.supplierId }).populate("customer_id", "business_name");
    res.json(reviews);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createReview, getSupplierReviews };
