import { fallbackProducts } from "../data/catalog.js";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export function categorySlug(category) {
  return String(category || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function categoryFromSlug(categories, slug) {
  return categories.find((category) => categorySlug(category) === slug);
}

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0
});

export function formatMoney(value) {
  return money.format(Number(value || 0)).replace("KES", "KSh");
}

export function getStockLeft(product) {
  return Number(
    product.stock_left ??
      product.available_units ??
      product.quantity_available ??
      product.stock ??
      product.inventory_count ??
      0
  );
}

export function normalizeProduct(product) {
  const categoryName = product.category_id?.name || product.category || "Bulk Deals";
  const price = product.price || product.supplier_price || product.min_price || product.oldPrice * 0.8 || 999;
  const stockLeft = getStockLeft(product) || Math.max(12, Math.round((price % 80) + 20));

  return {
    ...product,
    _id: product._id || product.slug || product.name,
    category: categoryName,
    price,
    oldPrice: product.oldPrice || Math.round(price * 1.16),
    rating: product.rating || 4.2,
    stock_left: stockLeft,
    image:
      product.images?.[0] ||
      product.image ||
      fallbackProducts[Math.floor(Math.random() * fallbackProducts.length)].image
  };
}
