import React from "react";
import { formatMoney } from "../utils/catalog.js";

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

export default function ProductCard({ product, onAdd, onView }) {
  const discount = Math.max(5, Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100));
  const rating = product.rating || 4.2;

  function handleCardKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView(product);
    }
  }

  return (
    <article
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={() => onView(product)}
      onKeyDown={handleCardKeyDown}
    >
      <span className="discount-badge">-{discount}%</span>
      <img src={product.image} alt={product.name} loading="lazy" />
      <div className="product-body">
        <p className="product-name">{product.name}</p>
        <strong className="price">{formatMoney(product.price)}</strong>
        <span className="old-price">{formatMoney(product.oldPrice)}</span>
        <div className="meta-line">
          <span>{product.unit_size || product.unit || product.category}</span>
          <span className="rating" aria-label={`${rating} out of 5 stars`}>
            <StarRating rating={rating} />
            <strong>{rating}</strong>
          </span>
        </div>
        <button
          className="add-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAdd(product._id);
          }}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
