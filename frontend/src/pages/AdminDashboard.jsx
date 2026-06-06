import React, { useEffect, useMemo, useState } from "react";
import { API_BASE, formatMoney } from "../utils/catalog.js";

const fallbackStats = {
  total_orders: 0,
  total_customers: 0,
  total_suppliers: 0,
  total_revenue: 0
};

const emptyProductForm = {
  name: "",
  brand: "",
  category_id: "",
  price: "",
  oldPrice: "",
  stock_left: "",
  unit: "piece",
  unit_size: "",
  image: "",
  description: ""
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminDashboard({ products, currentUser, onProductCreated }) {
  const [stats, setStats] = useState(fallbackStats);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [status, setStatus] = useState("Loading live admin dashboard data.");
  const [productStatus, setProductStatus] = useState("");

  const topProducts = useMemo(() => products.slice(0, 5), [products]);
  const checkoutAlerts = useMemo(() => orders.slice(0, 5), [orders]);

  useEffect(() => {
    async function loadDashboard() {
      if (!currentUser?.token) return;

      const headers = { Authorization: `Bearer ${currentUser.token}` };

      try {
        const [analyticsResponse, ordersResponse, usersResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE}/analytics/dashboard`, { headers }),
          fetch(`${API_BASE}/orders`, { headers }),
          fetch(`${API_BASE}/users`, { headers }),
          fetch(`${API_BASE}/categories`)
        ]);

        if (analyticsResponse.ok) {
          setStats(await analyticsResponse.json());
        }

        if (ordersResponse.ok) {
          const data = await ordersResponse.json();
          if (Array.isArray(data)) setOrders(data.slice(0, 5));
        }

        if (usersResponse.ok) {
          const data = await usersResponse.json();
          if (Array.isArray(data)) setUsers(data.slice(0, 5));
        }

        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json();
          if (Array.isArray(data)) {
            setCategories(data);
            setProductForm((currentForm) => ({
              ...currentForm,
              category_id: currentForm.category_id || data[0]?._id || ""
            }));
          }
        }

        if (analyticsResponse.ok || ordersResponse.ok || usersResponse.ok) {
          setStatus(`Live admin data loaded for ${currentUser.full_name || currentUser.email}.`);
        } else {
          setStatus("Your account is signed in, but admin access is required for live dashboard data.");
        }
      } catch (error) {
        setStatus(`Could not load live admin data: ${error.message}`);
      }
    }

    loadDashboard();
  }, [currentUser]);

  function updateProductForm(field, value) {
    setProductForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleCreateProduct(event) {
    event.preventDefault();

    if (!currentUser?.token) {
      setProductStatus("Sign in as an admin before adding products.");
      return;
    }

    const selectedCategory = categories.find((category) => category._id === productForm.category_id);
    const name = productForm.name.trim();
    const price = Number(productForm.price);

    if (!name || !selectedCategory || !price) {
      setProductStatus("Enter a product name, category, and price.");
      return;
    }

    const payload = {
      name,
      slug: `${slugify(name)}-${Date.now()}`,
      brand: productForm.brand.trim(),
      category_id: productForm.category_id,
      description: productForm.description.trim(),
      price,
      oldPrice: Number(productForm.oldPrice) || Math.round(price * 1.16),
      stock_left: Number(productForm.stock_left) || 0,
      unit: productForm.unit,
      unit_size: productForm.unit_size.trim(),
      images: productForm.image.trim() ? [productForm.image.trim()] : [],
      tags: [selectedCategory.name]
    };

    setProductStatus("Adding product...");

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add product");

      onProductCreated?.(data);
      setProductForm({ ...emptyProductForm, category_id: productForm.category_id });
      setProductStatus(`${data.name} added to the catalog.`);
    } catch (error) {
      setProductStatus(error.message);
    }
  }

  return (
    <main>
      <section className="admin-shell container">
        <div className="admin-hero">
          <div>
            <span>Danaba Admin</span>
            <h1>Operations Dashboard</h1>
            <p>{status}</p>
          </div>
          <span className="admin-session">{currentUser?.email}</span>
        </div>

        <div className="admin-stats">
          <article>
            <span>Total Orders</span>
            <strong>{stats.total_orders}</strong>
          </article>
          <article>
            <span>Customers</span>
            <strong>{stats.total_customers}</strong>
          </article>
          <article>
            <span>Suppliers</span>
            <strong>{stats.total_suppliers}</strong>
          </article>
          <article>
            <span>Revenue</span>
            <strong>{formatMoney(stats.total_revenue)}</strong>
          </article>
        </div>

        <div className="admin-grid">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Recent Orders</h2>
              <span>{orders.length ? "Live" : "Waiting for orders"}</span>
            </div>
            <div className="admin-table">
              {orders.length ? (
                orders.map((order) => (
                  <div className="admin-row" key={order._id}>
                    <strong>{order.order_number || order._id?.slice(-8)}</strong>
                    <span>{order.status || "pending"}</span>
                    <span>{formatMoney(order.total_amount)}</span>
                  </div>
                ))
              ) : (
                <p>No recent orders available yet.</p>
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Product Watch</h2>
              <span>{topProducts.length} items</span>
            </div>
            <div className="admin-table">
              {topProducts.map((product) => (
                <div className="admin-row" key={product._id}>
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                  <span>{formatMoney(product.price)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-panel admin-panel-wide">
            <div className="admin-panel-head">
              <h2>Add Product</h2>
              <span>Admin</span>
            </div>
            <form className="admin-product-form" onSubmit={handleCreateProduct}>
              <label>
                Product name
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(event) => updateProductForm("name", event.target.value)}
                  placeholder="Maize flour carton"
                />
              </label>
              <label>
                Brand
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(event) => updateProductForm("brand", event.target.value)}
                  placeholder="Danaba supplier"
                />
              </label>
              <label>
                Category
                <select
                  required
                  value={productForm.category_id}
                  onChange={(event) => updateProductForm("category_id", event.target.value)}
                >
                  {categories.map((category) => (
                    <option value={category._id} key={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Price
                <input
                  type="number"
                  min="0"
                  required
                  value={productForm.price}
                  onChange={(event) => updateProductForm("price", event.target.value)}
                  placeholder="2500"
                />
              </label>
              <label>
                Old price
                <input
                  type="number"
                  min="0"
                  value={productForm.oldPrice}
                  onChange={(event) => updateProductForm("oldPrice", event.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  value={productForm.stock_left}
                  onChange={(event) => updateProductForm("stock_left", event.target.value)}
                  placeholder="40"
                />
              </label>
              <label>
                Unit
                <select value={productForm.unit} onChange={(event) => updateProductForm("unit", event.target.value)}>
                  <option value="piece">Piece</option>
                  <option value="carton">Carton</option>
                  <option value="kg">Kg</option>
                  <option value="litre">Litre</option>
                  <option value="pack">Pack</option>
                </select>
              </label>
              <label>
                Unit size
                <input
                  type="text"
                  value={productForm.unit_size}
                  onChange={(event) => updateProductForm("unit_size", event.target.value)}
                  placeholder="12 x 2kg"
                />
              </label>
              <label className="admin-field-wide">
                Image URL
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(event) => updateProductForm("image", event.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label className="admin-field-wide">
                Description
                <textarea
                  value={productForm.description}
                  onChange={(event) => updateProductForm("description", event.target.value)}
                  placeholder="Short product details for customers"
                />
              </label>
              <button className="auth-submit admin-field-wide" type="submit">
                Add item
              </button>
              <p className="auth-status admin-field-wide">{productStatus}</p>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Checkout Alerts</h2>
              <span>{checkoutAlerts.length ? "New" : "Waiting"}</span>
            </div>
            <div className="admin-table">
              {checkoutAlerts.length ? (
                checkoutAlerts.map((alert) => (
                  <div className="admin-row" key={alert._id}>
                    <strong>{alert.order_number}</strong>
                    <span>{alert.customer_id?.user_id?.full_name || alert.delivery_address?.full_name || "Customer"}</span>
                    <span>{formatMoney(alert.total_amount)}</span>
                  </div>
                ))
              ) : (
                <p>No checkout alerts yet.</p>
              )}
            </div>
          </section>

          <section className="admin-panel admin-panel-wide">
            <div className="admin-panel-head">
              <h2>Users</h2>
              <span>{users.length ? "Live" : "Admin only"}</span>
            </div>
            <div className="admin-table">
              {users.length ? (
                users.map((user) => (
                  <div className="admin-row" key={user._id}>
                    <strong>{user.full_name || user.email}</strong>
                    <span>{user.role}</span>
                    <span>{user.status || "active"}</span>
                  </div>
                ))
              ) : (
                <p>Sign in with an admin account to preview users.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
