const Product = require("../models/Product");
const SupplierProduct = require("../models/SupplierProduct");

function buildProductPayload(body = {}) {
  const images = Array.isArray(body.images)
    ? body.images.filter(Boolean)
    : body.image
      ? [body.image]
      : [];

  const payload = {
    ...body,
    category: body.category || body.category_name || body.categoryLabel || body.category_title || "",
    price: body.price !== undefined ? Number(body.price) : body.price,
    oldPrice: body.oldPrice !== undefined ? Number(body.oldPrice) : body.oldPrice,
    rating: body.rating !== undefined ? Number(body.rating) : body.rating,
    stock_left: body.stock_left !== undefined ? Number(body.stock_left) : body.stock_left,
    images,
    image: body.image || images[0] || "",
    details: Array.isArray(body.details) ? body.details : body.details ? [body.details].flat() : []
  };

  if (!payload.slug && payload.name) {
    payload.slug = String(payload.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return payload;
}

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(buildProductPayload(req.body));
    res.status(201).json(product);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { is_active: true };
    if (category) query.category_id = category;
    if (search) query.name = { $regex: search, $options: "i" };
    const products = await Product.find(query).populate("category_id", "name");
    res.json(products);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category_id", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    const suppliers = await SupplierProduct.find({ product_id: req.params.id, is_available: true }).populate("supplier_id", "business_name county rating");
    res.json({ product, suppliers });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, buildProductPayload(req.body), { new: true });
    res.json(product);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
