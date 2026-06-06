const express = require("express");
const router = express.Router();
const {
  listUsers,
  blockUser,
  unblockUser,
  resetPassword,
  createAdmin,
  deleteUser,
  listProducts,
  createProduct,
  updateProduct
} = require("../controllers/superAdminController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

router.use(protect, superAdminOnly);

router.get("/users", listUsers);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);
router.put("/users/:id/reset-password", resetPassword);
router.post("/users/create-admin", createAdmin);
router.delete("/users/:id", deleteUser);
router.get("/products", listProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);

module.exports = router;
