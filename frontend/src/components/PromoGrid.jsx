import React from "react";

export default function PromoGrid() {
  return (
    <section className="promo-grid container" aria-label="Danaba benefits">
      <article>
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
          alt="Warehouse shelves with packaged goods"
        />
        <div>
          <span>For retailers</span>
          <h3>Build repeat stock lists</h3>
        </div>
      </article>
      <article>
        <img
          src="https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=600&q=80"
          alt="Delivery boxes being moved in a warehouse"
        />
        <div>
          <span>For suppliers</span>
          <h3>Reach more buyers</h3>
        </div>
      </article>
      <article>
        <img
          src="https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=600&q=80"
          alt="Customer paying by card at checkout"
        />
        <div>
          <span>For agents</span>
          <h3>Track field orders</h3>
        </div>
      </article>
    </section>
  );
}
