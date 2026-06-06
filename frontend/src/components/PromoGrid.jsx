import React from "react";
import { buildBannerGraphic } from "../utils/productImage.js";

export default function PromoGrid() {
  const warehouseGraphic = buildBannerGraphic({ title: "Warehouse shelves", subtitle: "For retailers" });
  const deliveryGraphic = buildBannerGraphic({ title: "Delivery flow", subtitle: "For suppliers" });
  const checkoutGraphic = buildBannerGraphic({ title: "Fast checkout", subtitle: "For agents" });

  return (
    <section className="promo-grid container" aria-label="Danaba benefits">
      <article>
        <img src={warehouseGraphic} alt="Warehouse shelves with packaged goods" />
        <div>
          <span>For retailers</span>
          <h3>Build repeat stock lists</h3>
        </div>
      </article>
      <article>
        <img src={deliveryGraphic} alt="Delivery boxes being moved in a warehouse" />
        <div>
          <span>For suppliers</span>
          <h3>Reach more buyers</h3>
        </div>
      </article>
      <article>
        <img src={checkoutGraphic} alt="Customer paying by card at checkout" />
        <div>
          <span>For agents</span>
          <h3>Track field orders</h3>
        </div>
      </article>
    </section>
  );
}
