import React from "react";
import ProductCard from "../components/ProductCard.jsx";

export default function Wishlist({
  products,
  wishlistIds = [],
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist
}) {
  const wishlistProducts = products.filter((product) => wishlistIds.includes(product._id));

  return (
    <main>
      <section className="content-row container page-panel">
        <div className="section-heading">
          <div>
            <span>Your saved items</span>
            <h2>Wishlist</h2>
          </div>
        </div>

        {wishlistProducts.length ? (
          <div className="product-grid">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onRemoveFromWishlist={onRemoveFromWishlist}
                isWishlisted
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No items saved yet</h3>
            <p>Open any product and add it to your wishlist to keep track of it here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
