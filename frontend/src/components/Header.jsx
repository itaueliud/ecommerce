import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

          <nav className="header-nav-links" aria-label="Primary navigation">
            <Link to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </Link>
            <Link to="/categories" className="nav-link">
              <span className="nav-icon">☰</span>
              <span className="nav-label">Categories</span>
            </Link>
            <button className="nav-link nav-link-button" type="button" onClick={onCartOpen}>
              <span className="nav-icon">
                🛒
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </span>
              <span className="nav-label">Cart</span>
            </button>
            <Link to="/wishlist" className="nav-link">
              <span className="nav-icon">♡</span>
              <span className="nav-label">Wishlist</span>
            </Link>
            <Link to="/account" className="nav-link">
              <span className="nav-icon">👤</span>
              <span className="nav-label">{currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Account"}</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
