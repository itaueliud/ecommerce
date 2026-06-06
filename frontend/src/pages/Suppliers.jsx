import React from "react";
import { fallbackSuppliers } from "../data/catalog.js";

export default function Suppliers() {
  return (
    <main>
      <section className="content-row container" id="suppliers">
        <div className="section-heading">
          <h2>Popular Suppliers</h2>
          <span>Based on product availability and delivery coverage</span>
        </div>
        <div className="supplier-grid">
          {fallbackSuppliers.map((supplier) => (
            <article className="supplier-card" key={supplier.name}>
              <strong>{supplier.name}</strong>
              <span>
                {supplier.type} in {supplier.county}
              </span>
              <span>Rating {supplier.rating} from repeat buyers</span>
              <span className="verified">Verified</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
