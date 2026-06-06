const Product = require("../models/Product");
const SupplierProduct = require("../models/SupplierProduct");

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
