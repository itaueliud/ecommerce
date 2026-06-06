import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav({ cartCount = 0, onCartOpen }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { label: "Home", icon: "🏠", path: "/" },
    { label: "Categories", icon: "☰", path: "/categories" },
    { label: "Cart", icon: "🛒", path: "/cart", badge: cartCount },
    { label: "Wishlist", icon: "♡", path: "/wishlist" },
    { label: "Account", icon: "👤", path: "/account" }
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          type="button"
          className={`bottom-nav__tab${pathname === tab.path ? " active" : ""}`}
          onClick={() => {
            if (tab.path === "/cart") {
              onCartOpen?.();
              navigate(tab.path);
              return;
            }
            navigate(tab.path);
          }}
        >
          <span className="bottom-nav__icon">
            {tab.icon}
            {tab.badge > 0 ? <span className="badge">{tab.badge}</span> : null}
          </span>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
