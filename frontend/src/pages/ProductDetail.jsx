import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatMoney } from "../utils/catalog.js";
import { applyProductImageFallback, getProductImage } from "../utils/productImage.js";

export default function ProductDetail({
  products,
  onAddToCart,
  wishlistIds = [],
  onAddToWishlist,
  onRemoveFromWishlist
}) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item._id === productId);

  if (!product) {
    return (
      <main>
        <section className="content-row container page-panel">
          <button className="back-btn" type="button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="empty-state">
            <h3>Product not found</h3>
            <p>The item you opened is no longer available in the catalog.</p>
          </div>
        </section>
      </main>
    );
  }

  const isWishlisted = wishlistIds.includes(product._id);

  return (
    <main>
      <section className="content-row container page-panel product-detail-page">
        <button className="back-btn" type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="product-detail-shell">
          <div className="product-detail-media">
            <img src={getProductImage(product)} alt={product.name} onError={(event) => applyProductImageFallback(event, product)} />
          </div>

          <div className="product-detail-copy">
            {product.offer_label ? <span className="badge-offer">{product.offer_label}</span> : null}
            <h1>{product.name}</h1>
            <p className="product-detail-brand">{product.brand || product.category}</p>

            <div className="product-detail-price">
              <strong>{formatMoney(product.price)}</strong>
              {product.oldPrice ? <span>{formatMoney(product.oldPrice)}</span> : null}
            </div>

            <p>{product.description}</p>

            {product.ingredients ? (
              <div className="product-info-block">
                <h3>Ingredients</h3>
                <p>{product.ingredients}</p>
              </div>
            ) : null}

            {Array.isArray(product.details) && product.details.length > 0 ? (
              <div className="product-info-block">
                <h3>Details</h3>
                <ul>
                  {product.details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="product-detail-actions">
              <button className="btn-add-cart" type="button" onClick={() => onAddToCart(product._id)}>
                Add to cart
              </button>
              {onAddToWishlist && onRemoveFromWishlist ? (
                <button
                  className="wishlist-button"
                  type="button"
                  onClick={() => (isWishlisted ? onRemoveFromWishlist(product._id) : onAddToWishlist(product._id))}
                >
                  {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
