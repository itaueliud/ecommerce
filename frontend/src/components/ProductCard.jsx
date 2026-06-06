import React from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../utils/catalog.js";
import { applyProductImageFallback, getProductImage } from "../utils/productImage.js";

function StarRating({ rating = 4.2 }) {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <span className="star-rating" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <span className={star <= roundedRating ? "filled" : ""} key={star}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductCard({ product, onAdd, onAddToWishlist, onRemoveFromWishlist, isWishlisted }) {
  const discount = product.oldPrice ? Math.max(5, Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)) : 0;
  const rating = product.rating || 4.2;

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-card__link" aria-label={product.name}>
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <img
          src={getProductImage(product)}
          alt={product.name}
          loading="lazy"
          onError={(event) => applyProductImageFallback(event, product)}
        />
        <div className="product-body">
          <p className="product-name">{product.name}</p>
          <strong className="price">{formatMoney(product.price)}</strong>
          {product.oldPrice ? <span className="old-price">{formatMoney(product.oldPrice)}</span> : null}
          <div className="meta-line">
            <span>{product.unit_size || product.unit || product.category}</span>
            <span className="rating" aria-label={`${rating} out of 5 stars`}>
              <StarRating rating={rating} />
              <strong>{rating}</strong>
            </span>
          </div>
        </div>
      </Link>
      <div className="product-card__actions">
        <button className="add-button" type="button" onClick={() => onAdd(product._id)}>
          Add to cart
        </button>
        {onAddToWishlist && onRemoveFromWishlist ? (
          <button
            className="wishlist-button"
            type="button"
            onClick={() => (isWishlisted ? onRemoveFromWishlist(product._id) : onAddToWishlist(product._id))}
          >
            {isWishlisted ? "Remove wishlist" : "Add to wishlist"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
