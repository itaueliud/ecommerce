const Supplier = require("../models/Supplier");

const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({ ...req.body, user_id: req.user._id });
    res.status(201).json(supplier);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ status: "active" }).populate("user_id", "full_name email phone");
    res.json(suppliers);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate("user_id", "full_name email phone");
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(supplier);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier };
