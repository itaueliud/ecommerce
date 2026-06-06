import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthForm from "../components/AuthForm.jsx";
import { API_BASE, formatMoney } from "../utils/catalog.js";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(new Date(value));
}

export default function Account({ authStatus, onLogin, onRegister, currentUser, onSignOut }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!currentUser?.token) {
        setOrders([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/orders/my`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setOrders(data.slice(0, 3));
          setStatus(data.length ? "" : "No recent orders yet.");
        }
      } catch {
        setStatus("Could not load recent orders.");
      }
    }

    loadOrders();
  }, [currentUser?.token]);

  if (!currentUser) {
    return (
      <main>
        <section className="content-row container page-panel">
          <div className="section-heading">
            <h2>Account</h2>
          </div>
          <AuthForm status={authStatus} onLogin={onLogin} onRegister={onRegister} />
        </section>
      </main>
    );
  }

  const firstName = currentUser.full_name?.split(" ")[0] || "Account";

  return (
    <main>
      <section className="content-row container page-panel account-page">
        <div className="account-topbar">
          <Link to="/" className="account-back">
            ←
          </Link>
          <h2>My Account</h2>
          <button type="button" className="account-settings" aria-label="Settings">
            ⚙
          </button>
        </div>

        <div className="account-card">
          <div className="account-avatar">{firstName.charAt(0)}</div>
          <div className="account-profile">
            <strong>{currentUser.full_name || currentUser.email}</strong>
            <span>{currentUser.phone || currentUser.email}</span>
            <span>{currentUser.email}</span>
          </div>
        </div>

        <div className="account-stats">
          <article>
            <strong>{orders.length ? orders.length : 0}</strong>
            <span>Orders</span>
          </article>
          <article>
            <strong>0</strong>
            <span>Wishlist</span>
          </article>
          <article>
            <strong>0</strong>
            <span>Reviews</span>
          </article>
        </div>

        <section className="account-section">
          <div className="account-section__head">
            <span>Recent orders</span>
          </div>
          {orders.length ? (
            <div className="account-list">
              {orders.map((order) => (
                <article className="account-list__row" key={order._id}>
                  <div className="account-list__icon">◻</div>
                  <div>
                    <strong>{order.order_number}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <strong className={`status-pill status-${String(order.status || "pending").replace(/_/g, "-")}`}>
                    {String(order.status || "pending").replace(/_/g, " ")}
                  </strong>
                </article>
              ))}
            </div>
          ) : (
            <p className="account-muted">{status || "No recent orders yet."}</p>
          )}
        </section>

        <section className="account-section">
          <div className="account-section__head">
            <span>Account</span>
          </div>
          <div className="account-menu">
            <Link to="/orders">Order tracking</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/account">My reviews</Link>
            <button type="button" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </section>

        {authStatus ? <p className="auth-status">{authStatus}</p> : null}
      </section>
    </main>
  );
}
