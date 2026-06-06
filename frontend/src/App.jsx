import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import Header from "./components/Header.jsx";
import Toast from "./components/Toast.jsx";
import { fallbackCategories, fallbackProducts, targetCategories } from "./data/catalog.js";
import Account from "./pages/Account.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CartPage from "./pages/CartPage.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Orders from "./pages/Orders.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import { API_BASE, normalizeProduct } from "./utils/catalog.js";

export default function App() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(fallbackProducts);
  const [categories, setCategories] = useState(fallbackCategories);
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem("danabaUser") || "null"));
  const [wishlist, setWishlist] = useState([]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const roleRedirects = {
    superadmin: "/superadmin",
    admin: "/admin",
    customer: "/"
  };

  function mergeTargetCategories(categories) {
    return [...new Set([...targetCategories, ...categories])];
  }

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/products`)
        ]);

        if (categoryResponse.ok) {
          const data = await categoryResponse.json();
          if (Array.isArray(data) && data.length) {
            setCategories(mergeTargetCategories(data.map((category) => category.name || category)));
          }
        }

        if (productResponse.ok) {
          const data = await productResponse.json();
          if (Array.isArray(data) && data.length) setProducts(data.map(normalizeProduct));
        }
      } catch {
        showToast("Using demo catalog until the backend is running.");
      }
    }

    loadCatalog();
  }, []);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2600);
  }

  function addToCart(id) {
    const product = products.find((item) => item._id === id);
    if (!product) return;

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item._id === id);
      if (existing) {
        return currentCart.map((item) => (item._id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...currentCart, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added to cart`);
  }

  function addToWishlist(id) {
    setWishlist((currentWishlist) => (currentWishlist.includes(id) ? currentWishlist : [...currentWishlist, id]));
    const product = products.find((item) => item._id === id);
    if (product) showToast(`${product.name} added to wishlist`);
  }

  function removeFromWishlist(id) {
    setWishlist((currentWishlist) => currentWishlist.filter((item) => item !== id));
    const product = products.find((item) => item._id === id);
    if (product) showToast(`${product.name} removed from wishlist`);
  }

  function updateQuantity(id, direction) {
    setCart((currentCart) =>
      currentCart
        .map((item) => (item._id === id ? { ...item, qty: item.qty + direction } : item))
        .filter((item) => item.qty > 0)
    );
  }

  function finishAuthRedirect(role) {
    if (localStorage.getItem("danabaPendingCheckout") === "true") {
      localStorage.removeItem("danabaPendingCheckout");
      navigate("/cart");
      return;
    }

    navigate(roleRedirects[role] || "/");
  }

  async function login(email, password) {
    setAuthStatus("Signing you in...");
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("danabaUser", JSON.stringify(data));
      setCurrentUser(data);
      setAuthStatus(`Signed in as ${data.full_name || data.email} (${data.role})`);
      showToast("Welcome back to Danaba");
      finishAuthRedirect(data.role);
    } catch (error) {
      setAuthStatus(error.message);
    }
  }

  async function registerCustomer(fullName, email, password, phone) {
    if (!fullName || !email || !password || !phone) {
      setAuthStatus("Enter your name, email, phone, and password first.");
      return;
    }

    setAuthStatus("Creating customer account...");
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      localStorage.setItem("danabaUser", JSON.stringify(data));
      setCurrentUser(data);
      setAuthStatus(`Signed in as ${data.full_name || data.email} (${data.role})`);
      showToast("Customer account created");
      finishAuthRedirect(data.role);
    } catch (error) {
      setAuthStatus(error.message);
    }
  }

  function requireCheckoutAccount() {
    localStorage.setItem("danabaPendingCheckout", "true");
    showToast("Create or sign in to your account before checkout.");
    navigate("/account");
  }

  function handleOrderConfirmed(receipt) {
    setCart([]);
    showToast(`Order ${receipt.orderNumber} confirmed.`);
  }

  function upsertProduct(product) {
    const normalizedProduct = normalizeProduct(product);
    setProducts((currentProducts) => {
      const exists = currentProducts.some((item) => item._id === normalizedProduct._id);
      if (!exists) {
        return [normalizedProduct, ...currentProducts];
      }
      return currentProducts.map((item) => (item._id === normalizedProduct._id ? normalizedProduct : item));
    });
  }

  function removeProduct(id) {
    setProducts((currentProducts) => currentProducts.filter((item) => item._id !== id));
  }

  function signOut() {
    localStorage.removeItem("danabaUser");
    setCurrentUser(null);
    setAuthStatus("Signed out.");
    navigate("/");
  }

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartCount={cartCount}
        onCartOpen={() => navigate("/cart")}
        currentUser={currentUser}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Marketplace
              categories={categories}
              products={products}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddToCart={addToCart}
              wishlistIds={wishlist}
              onAddToWishlist={addToWishlist}
              onRemoveFromWishlist={removeFromWishlist}
            />
          }
        />
        <Route
          path="/product/:productId"
          element={
            <ProductDetail
              products={products}
              onAddToCart={addToCart}
              wishlistIds={wishlist}
              onAddToWishlist={addToWishlist}
              onRemoveFromWishlist={removeFromWishlist}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <Wishlist
              products={products}
              wishlistIds={wishlist}
              onAddToCart={addToCart}
              onAddToWishlist={addToWishlist}
              onRemoveFromWishlist={removeFromWishlist}
            />
          }
        />
        <Route path="/cart" element={
          <CartPage
            cart={cart}
            onQtyChange={updateQuantity}
            currentUser={currentUser}
            onRequireAccount={requireCheckoutAccount}
            onOrderConfirmed={handleOrderConfirmed}
            onCloseCart={() => navigate("/")}
          />
        } />
        <Route
          path="/categories"
          element={<Navigate to="/" replace />}
        />
        <Route
          path="/categories/:categorySlug"
          element={
            <CategoryPage
              categories={categories}
              products={products}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddToCart={addToCart}
              wishlistIds={wishlist}
              onAddToWishlist={addToWishlist}
              onRemoveFromWishlist={removeFromWishlist}
            />
          }
        />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/account" element={<Account authStatus={authStatus} onLogin={login} onRegister={registerCustomer} currentUser={currentUser} onSignOut={signOut} />} />
        <Route path="/orders" element={<Orders currentUser={currentUser} showToast={showToast} />} />
        <Route
          path="/admin"
          element={
            currentUser?.role === "admin" ? (
              <AdminDashboard
                products={products}
                currentUser={currentUser}
                onProductCreated={upsertProduct}
                onProductSaved={upsertProduct}
                onProductDeleted={removeProduct}
              />
            ) : (
              <Navigate to="/account" replace />
            )
          }
        />
        <Route
          path="/superadmin"
          element={
            currentUser?.role === "superadmin" ? (
            <SuperAdminDashboard
              products={products}
              currentUser={currentUser}
              onProductSaved={upsertProduct}
              onProductDeleted={removeProduct}
            />
            ) : (
              <Navigate to="/account" replace />
            )
          }
        />
      </Routes>
      <BottomNav cartCount={cartCount} onCartOpen={() => navigate("/cart")} />
      <Toast message={toast} />
    </>
  );
}
