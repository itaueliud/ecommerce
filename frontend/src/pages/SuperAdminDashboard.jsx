import React, { useEffect, useMemo, useState } from "react";
import { API_BASE, formatMoney } from "../utils/catalog.js";
import { applyProductImageFallback, getProductImage } from "../utils/productImage.js";

const emptyAdminForm = {
  full_name: "",
  email: "",
  phone: "",
  password: ""
};

const emptyPasswordForm = {
  newPassword: ""
};

const emptyProductForm = {
  name: "",
  brand: "",
  category: "",
  price: "",
  oldPrice: "",
  stock_left: "",
  image: "",
  offer_label: "",
  description: "",
  unit_size: "",
  ingredients: "",
  rating: "4.5"
};

function asDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Never" : date.toLocaleString();
}

function toDetailsArray(details) {
  if (Array.isArray(details)) return details;
  if (!details) return [];
  return String(details)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function initialTabCount(users) {
  return {
    admins: users.filter((user) => user.role === "admin").length,
    customers: users.filter((user) => user.role === "customer").length
  };
}

export default function SuperAdminDashboard({
  products = [],
  currentUser,
  onProductSaved,
  onProductDeleted
}) {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading superadmin console...");
  const [userStatus, setUserStatus] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState(products);

  useEffect(() => {
    setCatalogProducts(products);
  }, [products]);

  const categories = useMemo(() => {
    return [...new Set(catalogProducts.map((product) => product.category).filter(Boolean))];
  }, [catalogProducts]);
  const admins = useMemo(() => users.filter((user) => user.role === "admin"), [users]);
  const customers = useMemo(() => users.filter((user) => user.role === "customer"), [users]);
  const blockedUsers = useMemo(() => users.filter((user) => user.blocked), [users]);
  const totals = useMemo(() => initialTabCount(users), [users]);
  const totalRevenue = useMemo(
    () => catalogProducts.reduce((sum, product) => sum + Number(product.price || 0), 0),
    [catalogProducts]
  );

  async function loadUsers() {
    const response = await fetch(`${API_BASE}/superadmin/users`, {
      headers: { Authorization: `Bearer ${currentUser?.token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load users");
    setUsers(data);
  }

  async function loadProducts() {
    const response = await fetch(`${API_BASE}/superadmin/products`, {
      headers: { Authorization: `Bearer ${currentUser?.token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load products");
    setCatalogProducts(data);
  }

  useEffect(() => {
    async function bootstrap() {
      if (!currentUser?.token) return;

      try {
        await Promise.all([loadUsers(), loadProducts()]);
        setStatus(`Superadmin console ready for ${currentUser.full_name || currentUser.email}.`);
      } catch (error) {
        setStatus(error.message);
      }
    }

    bootstrap();
  }, [currentUser]);

  function updateAdminForm(field, value) {
    setAdminForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function updatePasswordForm(field, value) {
    setPasswordForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function updateProductForm(field, value) {
    setProductForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function openNewProductForm() {
    setEditingProduct(null);
    setProductForm({
      ...emptyProductForm,
      category: categories[0] || ""
    });
    setShowProductForm(true);
  }

  function openEditProductForm(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: product.price?.toString() || "",
      oldPrice: product.oldPrice?.toString() || "",
      stock_left: product.stock_left?.toString() || "",
      image: product.image || product.images?.[0] || "",
      offer_label: product.offer_label || "",
      description: product.description || "",
      unit_size: product.unit_size || "",
      ingredients: product.ingredients || "",
      rating: product.rating?.toString() || "4.5"
    });
    setShowProductForm(true);
  }

  async function handleCreateAdmin(event) {
    event.preventDefault();
    setUserStatus("Creating admin account...");

    try {
      const response = await fetch(`${API_BASE}/superadmin/users/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(adminForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create admin");
      setShowAdminForm(false);
      setAdminForm(emptyAdminForm);
      setUserStatus(data.message || "Admin created");
      await loadUsers();
    } catch (error) {
      setUserStatus(error.message);
    }
  }

  async function handleUserAction(endpoint, method = "PUT", body) {
    setUserStatus("Updating user...");
    const response = await fetch(`${API_BASE}/superadmin${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentUser.token}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "User action failed");
    await loadUsers();
    setUserStatus(data.message || "User updated");
  }

  async function handleSubmitPassword(event) {
    event.preventDefault();
    if (!passwordUser) return;
    setUserStatus("Resetting password...");
    try {
      await handleUserAction(`/users/${passwordUser._id}/reset-password`, "PUT", passwordForm);
      setShowPasswordModal(false);
      setPasswordUser(null);
      setPasswordForm(emptyPasswordForm);
    } catch (error) {
      setUserStatus(error.message);
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setProductStatus(editingProduct ? "Saving product..." : "Creating product...");

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice === "" ? undefined : Number(productForm.oldPrice),
      stock_left: Number(productForm.stock_left || 0),
      rating: Number(productForm.rating || 4.5),
      details: toDetailsArray(productForm.details),
      image: productForm.image.trim(),
      images: productForm.image.trim() ? [productForm.image.trim()] : []
    };

    try {
      const response = await fetch(
        `${API_BASE}/superadmin/products${editingProduct ? `/${editingProduct._id}` : ""}`,
        {
          method: editingProduct ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save product");

      const savedProduct = data.product || data;
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setProductStatus(editingProduct ? "Product updated." : "Product created.");
      await loadProducts();
      onProductSaved?.(savedProduct);
    } catch (error) {
      setProductStatus(error.message);
    }
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setProductStatus("Deleting product...");

    try {
      const response = await fetch(`${API_BASE}/superadmin/products/${product._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete product");
      setProductStatus(data.message || "Product deleted");
      await loadProducts();
      onProductDeleted?.(product._id);
    } catch (error) {
      setProductStatus(error.message);
    }
  }

  return (
    <main>
      <section className="admin-shell container superadmin-shell">
        <div className="superadmin-card">
          <div className="superadmin-card__head">
            <div>
              <h1>Superadmin Panel</h1>
              <p>{status}</p>
            </div>
            <span className="superadmin-pill">Superadmin</span>
          </div>

          <div className="superadmin-tabs">
            <button className={tab === "users" ? "active" : ""} type="button" onClick={() => setTab("users")}>
              Users
            </button>
            <button className={tab === "admins" ? "active" : ""} type="button" onClick={() => setTab("admins")}>
              Admins
            </button>
            <button className={tab === "products" ? "active" : ""} type="button" onClick={() => setTab("products")}>
              Products
            </button>
            <button className={tab === "reports" ? "active" : ""} type="button" onClick={() => setTab("reports")}>
              Reports
            </button>
          </div>

          <div className="superadmin-stats">
            <article>
              <strong>{totals.admins}</strong>
              <span>Admins</span>
            </article>
            <article>
              <strong>{totals.customers}</strong>
              <span>Customers</span>
            </article>
          </div>

          {tab === "users" && (
            <section className="superadmin-section">
              <div className="superadmin-section__head">
                <h2>Customers</h2>
                <button className="inline-action" type="button" onClick={() => setShowAdminForm(true)}>
                  + New admin
                </button>
              </div>
              <div className="superadmin-list">
                {customers.map((user) => (
                  <div className="superadmin-row-item" key={user._id}>
                    <div className="superadmin-avatar">{(user.full_name || user.email || "U").charAt(0).toUpperCase()}</div>
                    <div className="superadmin-usercopy">
                      <strong>{user.full_name || user.email}</strong>
                      <span>{user.email} · last login {asDate(user.last_login)}</span>
                      <div className="badge-row">
                        <span className="mini-badge mini-customer">customer</span>
                        {user.blocked ? <span className="mini-badge mini-blocked">blocked</span> : null}
                      </div>
                    </div>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleUserAction(`/users/${user._id}/reset-password`, "PUT", { newPassword: "Temp@12345" })}>
                        🔑
                      </button>
                      <button type="button" onClick={() => handleUserAction(`/users/${user._id}/${user.blocked ? "unblock" : "block"}`)}>
                        {user.blocked ? "🟢" : "⛔"}
                      </button>
                      <button type="button" onClick={() => handleUserAction(`/users/${user._id}`, "DELETE")}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "admins" && (
            <section className="superadmin-section">
              <div className="superadmin-section__head">
                <h2>Admins</h2>
                <button className="inline-action" type="button" onClick={() => setShowAdminForm(true)}>
                  + New admin
                </button>
              </div>
              <div className="superadmin-list">
                {admins.map((user) => (
                  <div className="superadmin-row-item" key={user._id}>
                    <div className="superadmin-avatar">{(user.full_name || user.email || "A").charAt(0).toUpperCase()}</div>
                    <div className="superadmin-usercopy">
                      <strong>{user.full_name || user.email}</strong>
                      <span>{user.email} · last login {asDate(user.last_login)}</span>
                      <div className="badge-row">
                        <span className="mini-badge mini-admin">admin</span>
                        {user.blocked ? <span className="mini-badge mini-blocked">blocked</span> : null}
                      </div>
                    </div>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleUserAction(`/users/${user._id}/reset-password`, "PUT", { newPassword: "Temp@12345" })}>
                        🔑
                      </button>
                      <button type="button" onClick={() => handleUserAction(`/users/${user._id}/${user.blocked ? "unblock" : "block"}`)}>
                        {user.blocked ? "🟢" : "⛔"}
                      </button>
                      <button type="button" onClick={() => handleUserAction(`/users/${user._id}`, "DELETE")}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {userStatus ? <p className="auth-status">{userStatus}</p> : null}
            </section>
          )}

          {tab === "products" && (
            <section className="superadmin-section">
              <div className="superadmin-section__head">
                <h2>Products</h2>
                <button className="inline-action" type="button" onClick={openNewProductForm}>
                  + Add product
                </button>
              </div>
              <div className="superadmin-list superadmin-products">
                {catalogProducts.map((product) => (
                  <div className="superadmin-product-row" key={product._id}>
                    <div className="superadmin-product-thumb">
                      <img src={getProductImage(product)} alt={product.name} onError={(event) => applyProductImageFallback(event, product)} />
                    </div>
                    <div className="superadmin-usercopy">
                      <strong>{product.name}</strong>
                      <span>
                        {formatMoney(product.price)} · stock: {product.stock_left ?? 0}
                      </span>
                    </div>
                    <button className="edit-button" type="button" onClick={() => openEditProductForm(product)}>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              {productStatus ? <p className="auth-status">{productStatus}</p> : null}
            </section>
          )}

          {tab === "reports" && (
            <section className="superadmin-section">
              <div className="superadmin-section__head">
                <h2>Reports</h2>
              </div>
              <div className="superadmin-report-grid">
                <article>
                  <strong>{users.length}</strong>
                  <span>Total users</span>
                </article>
                <article>
                  <strong>{blockedUsers.length}</strong>
                  <span>Blocked</span>
                </article>
                <article>
                  <strong>{catalogProducts.length}</strong>
                  <span>Products</span>
                </article>
                <article>
                  <strong>{formatMoney(totalRevenue)}</strong>
                  <span>Catalog value</span>
                </article>
              </div>
            </section>
          )}
        </div>

        {showAdminForm ? (
          <div className="modal-backdrop" role="presentation" onClick={() => setShowAdminForm(false)}>
            <section className="admin-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="admin-modal__head">
                <h3>Create Admin</h3>
                <button type="button" onClick={() => setShowAdminForm(false)}>
                  ×
                </button>
              </div>
              <form className="admin-form" onSubmit={handleCreateAdmin}>
                <label>
                  Full name
                  <input value={adminForm.full_name} onChange={(event) => updateAdminForm("full_name", event.target.value)} />
                </label>
                <label>
                  Email
                  <input type="email" value={adminForm.email} onChange={(event) => updateAdminForm("email", event.target.value)} />
                </label>
                <label>
                  Phone
                  <input value={adminForm.phone} onChange={(event) => updateAdminForm("phone", event.target.value)} />
                </label>
                <label>
                  Password
                  <input type="password" value={adminForm.password} onChange={(event) => updateAdminForm("password", event.target.value)} />
                </label>
                <button className="auth-submit" type="submit">
                  Create admin
                </button>
              </form>
            </section>
          </div>
        ) : null}

        {showPasswordModal && passwordUser ? (
          <div className="modal-backdrop" role="presentation" onClick={() => setShowPasswordModal(false)}>
            <section className="admin-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="admin-modal__head">
                <h3>Reset Password</h3>
                <button type="button" onClick={() => setShowPasswordModal(false)}>
                  ×
                </button>
              </div>
              <p className="admin-modal__sub">Set a temporary password for {passwordUser.full_name}.</p>
              <form className="admin-form" onSubmit={handleSubmitPassword}>
                <label>
                  New password
                  <input
                    type="text"
                    value={passwordForm.newPassword}
                    onChange={(event) => updatePasswordForm("newPassword", event.target.value)}
                  />
                </label>
                <button className="auth-submit" type="submit">
                  Reset password
                </button>
              </form>
            </section>
          </div>
        ) : null}

        {showProductForm ? (
          <div className="modal-backdrop" role="presentation" onClick={() => setShowProductForm(false)}>
            <section className="admin-modal admin-modal-wide" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="admin-modal__head">
                <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <button type="button" onClick={() => setShowProductForm(false)}>
                  ×
                </button>
              </div>
              <form className="admin-form admin-form-grid" onSubmit={handleProductSubmit}>
                <label>
                  Name
                  <input value={productForm.name} onChange={(event) => updateProductForm("name", event.target.value)} />
                </label>
                <label>
                  Brand
                  <input value={productForm.brand} onChange={(event) => updateProductForm("brand", event.target.value)} />
                </label>
                <label>
                  Category
                  <input list="product-categories" value={productForm.category} onChange={(event) => updateProductForm("category", event.target.value)} />
                  <datalist id="product-categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </label>
                <label>
                  Price
                  <input type="number" value={productForm.price} onChange={(event) => updateProductForm("price", event.target.value)} />
                </label>
                <label>
                  Old price
                  <input type="number" value={productForm.oldPrice} onChange={(event) => updateProductForm("oldPrice", event.target.value)} />
                </label>
                <label>
                  Stock
                  <input type="number" value={productForm.stock_left} onChange={(event) => updateProductForm("stock_left", event.target.value)} />
                </label>
                <label>
                  Image file or URL
                  <input
                    value={productForm.image}
                    onChange={(event) => updateProductForm("image", event.target.value)}
                    placeholder="Milo 500g.webp or https://..."
                  />
                </label>
                <label>
                  Offer label
                  <input value={productForm.offer_label} onChange={(event) => updateProductForm("offer_label", event.target.value)} />
                </label>
                <label>
                  Unit size
                  <input value={productForm.unit_size} onChange={(event) => updateProductForm("unit_size", event.target.value)} />
                </label>
                <label>
                  Rating
                  <input type="number" step="0.1" min="0" max="5" value={productForm.rating} onChange={(event) => updateProductForm("rating", event.target.value)} />
                </label>
                <label className="admin-field-wide">
                  Description
                  <textarea value={productForm.description} onChange={(event) => updateProductForm("description", event.target.value)} />
                </label>
                <label className="admin-field-wide">
                  Ingredients
                  <textarea value={productForm.ingredients} onChange={(event) => updateProductForm("ingredients", event.target.value)} />
                </label>
                <button className="auth-submit admin-field-wide" type="submit">
                  {editingProduct ? "Save changes" : "Create product"}
                </button>
              </form>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
