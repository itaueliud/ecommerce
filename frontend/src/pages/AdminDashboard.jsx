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
  const [posSearch, setPosSearch] = useState("");
  const [posCart, setPosCart] = useState([]);
  const [clientPhone, setClientPhone] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [posStatus, setPosStatus] = useState("");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [isSendingPayment, setIsSendingPayment] = useState(false);

  const topProducts = useMemo(() => products.slice(0, 5), [products]);
  const checkoutAlerts = useMemo(() => orders.slice(0, 5), [orders]);
  const posProducts = useMemo(() => {
    const query = posSearch.trim().toLowerCase();
    if (!query) return products.slice(0, 12);
    return products.filter((product) => {
      const haystack = `${product.name} ${product.brand || ""} ${product.category || ""} ${product.unit_size || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [products, posSearch]);
  const posTotal = useMemo(() => posCart.reduce((sum, item) => sum + item.price * item.qty, 0), [posCart]);

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

  function addToPosCart(product) {
    setPosCart((currentCart) => {
      const existing = currentCart.find((item) => item._id === product._id);
      if (existing) {
        return currentCart.map((item) => (item._id === product._id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...currentCart, { ...product, qty: 1 }];
    });
    setPosStatus(`${product.name} added to POS cart.`);
  }

  function updatePosQuantity(id, direction) {
    setPosCart((currentCart) =>
      currentCart
        .map((item) => (item._id === id ? { ...item, qty: item.qty + direction } : item))
        .filter((item) => item.qty > 0)
    );
  }

  async function generateReceipt() {
    if (!posCart.length) {
      setPosStatus("Add at least one product to the POS cart first.");
      return;
    }
    if (!clientPhone.trim()) {
      setPosStatus("Enter the client's phone number first.");
      return;
    }

    setIsGeneratingReceipt(true);
    setPosStatus("Generating receipt...");

    try {
      const response = await fetch(`${API_BASE}/orders/pos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          items: posCart.map((item) => ({ productId: item._id, qty: item.qty })),
          clientPhone
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to generate receipt");

      const receiptData = data.receipt || {
        orderNumber: data.order?.order_number || `ORD-${Date.now()}`,
        items: posCart,
        total: posTotal,
        clientPhone,
        date: new Date().toISOString(),
        orderId: data.order?._id
      };
      setReceipt(receiptData);
      setPosStatus(`Receipt ${receiptData.orderNumber} ready.`);
    } catch (error) {
      setPosStatus(error.message);
    } finally {
      setIsGeneratingReceipt(false);
    }
  }

  async function initiatePayment() {
    if (!receipt) {
      setPosStatus("Generate a receipt before sending M-Pesa payment.");
      return;
    }

    setIsSendingPayment(true);
    setPosStatus("Sending M-Pesa prompt...");

    try {
      const response = await fetch(`${API_BASE}/payments/mpesa/stkpush`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          phone: clientPhone,
          amount: receipt.total,
          orderId: receipt.orderId || receipt.orderNumber
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send M-Pesa prompt");
      setPosStatus("M-Pesa prompt sent successfully.");
    } catch (error) {
      setPosStatus(error.message);
    } finally {
      setIsSendingPayment(false);
    }
  }

  function printReceipt() {
    window.print();
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setProductStatus("Product creation is now reserved for superadmin.");
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

        <section className="admin-panel admin-panel-wide pos-panel">
          <div className="admin-panel-head">
            <h2>POS / Serve Customer</h2>
            <span>Cashier mode</span>
          </div>

          <div className="pos-grid">
            <div className="pos-column">
              <label>
                Search products
                <input
                  type="search"
                  value={posSearch}
                  onChange={(event) => setPosSearch(event.target.value)}
                  placeholder="Search by product, brand, or category"
                />
              </label>
              <div className="pos-product-list">
                {posProducts.map((product) => (
                  <button type="button" className="pos-product" key={product._id} onClick={() => addToPosCart(product)}>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                    <b>{formatMoney(product.price)}</b>
                  </button>
                ))}
              </div>
            </div>

            <div className="pos-column">
              <h3>POS cart</h3>
              <div className="pos-cart">
                {posCart.length ? (
                  posCart.map((item) => (
                    <div className="pos-cart-row" key={item._id}>
                      <strong>{item.name}</strong>
                      <span>{formatMoney(item.price)}</span>
                      <div className="qty-control">
                        <button type="button" onClick={() => updatePosQuantity(item._id, -1)}>
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button type="button" onClick={() => updatePosQuantity(item._id, 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No products selected yet.</p>
                )}
              </div>
              <div className="pos-total">
                <span>Running total</span>
                <strong>{formatMoney(posTotal)}</strong>
              </div>
            </div>

            <div className="pos-column">
              <label>
                Client phone
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(event) => setClientPhone(event.target.value)}
                  placeholder="07XXXXXXXX"
                />
              </label>
              <button className="auth-submit" type="button" onClick={generateReceipt} disabled={isGeneratingReceipt}>
                {isGeneratingReceipt ? "Generating..." : "Generate Receipt"}
              </button>
              <button className="auth-submit secondary-checkout" type="button" onClick={printReceipt} disabled={!receipt}>
                Print Receipt
              </button>
              <button className="auth-submit" type="button" onClick={initiatePayment} disabled={!receipt || isSendingPayment}>
                {isSendingPayment ? "Sending..." : "Pay via M-Pesa"}
              </button>
              {posStatus ? <p className="auth-status">{posStatus}</p> : null}
            </div>
          </div>

          <div className="receipt-printable">
            {receipt ? (
              <article className="thermal-receipt">
                <h3>Danaba FMCG</h3>
                <p>POS Receipt</p>
                <p>{new Date(receipt.date).toLocaleString()}</p>
                <p>Order: {receipt.orderNumber}</p>
                <p>Client: {receipt.clientPhone}</p>
                <div className="thermal-lines">
                  {receipt.items.map((item) => (
                    <div key={item._id} className="thermal-line">
                      <span>
                        {item.name} x{item.qty}
                      </span>
                      <strong>{formatMoney(item.price * item.qty)}</strong>
                    </div>
                  ))}
                </div>
                <div className="thermal-total">
                  <span>Total</span>
                  <strong>{formatMoney(receipt.total)}</strong>
                </div>
                <p>Thank you for shopping with us.</p>
              </article>
            ) : null}
          </div>
        </section>

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
                Image file or URL
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(event) => updateProductForm("image", event.target.value)}
                  placeholder="Milo 500g.webp or https://..."
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
