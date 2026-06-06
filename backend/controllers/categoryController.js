// categoryController.js
const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Category.find({ parent_id: req.params.id });
    res.json(subcategories);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createCategory, getAllCategories, getSubcategories };
