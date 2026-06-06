import React, { useEffect, useState } from "react";
import { API_BASE, formatMoney } from "../utils/catalog.js";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function orderTotal(order) {
  return formatMoney(order.total_amount || order.total || 0);
}

export default function Orders({ currentUser, showToast }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadOrders() {
    if (!currentUser?.token) {
      setOrders([]);
      setStatus("Sign in to view your order tracking.");
      return;
    }

    setIsLoading(true);
    setStatus("Loading orders...");
    try {
      const response = await fetch(`${API_BASE}/orders/my`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load orders");

      setOrders(Array.isArray(data) ? data : []);
      setStatus(data.length ? "" : "No active orders yet.");
    } catch (error) {
      setStatus(error.message);
      showToast(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [currentUser?.token]);

  return (
    <main>
      <section className="content-row container page-panel orders-panel">
        <div className="section-heading">
          <h2>Orders</h2>
          <button type="button" onClick={loadOrders} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {orders.length > 0 ? (
          <div className="order-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div>
                  <span>Order</span>
                  <strong>{order.order_number}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{String(order.status || "pending").replace(/_/g, " ")}</strong>
                </div>
                <div>
                  <span>Payment</span>
                  <strong>{order.payment_status || "unpaid"}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{orderTotal(order)}</strong>
                </div>
                <p>
                  {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"} ordered on {formatDate(order.createdAt)}.
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No active orders yet</h3>
            <p>{status || "Create a stock order from the marketplace, then track payment and delivery updates here."}</p>
          </div>
        )}
      </section>
    </main>
  );
}
