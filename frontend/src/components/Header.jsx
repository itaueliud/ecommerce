import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const whatsappChatLink = "https://wa.me/254710292540?text=Hello%20Danaba%2C%20I%20need%20help%20with%20an%20order.";

export default function Header({ searchTerm, setSearchTerm, cartCount, onCartOpen, currentUser }) {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/");
  }

  return (
    <>
      <div className="top-strip">
        <div className="container strip-content">
          <span>Sell on Danaba</span>
          <span>Bulk FMCG procurement for shops, homes, hotels, and offices</span>
          <div className="help-menu">
            <button
              type="button"
              className="help-trigger"
              aria-expanded={isHelpOpen}
              onClick={() => setIsHelpOpen((isOpen) => !isOpen)}
            >
              Help
            </button>
            {isHelpOpen && (
              <div className="help-options" role="menu">
                <button type="button" role="menuitem" onClick={() => setIsHelpOpen(false)}>
                  Live chat
                </button>
                <a href={whatsappChatLink} target="_blank" rel="noreferrer" role="menuitem">
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-grid">
          <Link className="brand" to="/" aria-label="Danaba home">
            <span className="brand-mark">D</span>
            <span>danaba</span>
          </Link>

          <form className="search-bar" onSubmit={handleSubmit}>
            <input
              type="search"
              placeholder="Search products, brands, categories"
              autoComplete="off"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <nav className="header-actions" aria-label="Account actions">
            <NavLink className="ghost-button nav-button" to="/account">
              Account
            </NavLink>
            <NavLink className="ghost-button nav-button" to="/orders">
              Orders
            </NavLink>
            <button className="cart-button" type="button" onClick={onCartOpen}>
              Cart
              <span>{cartCount}</span>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
