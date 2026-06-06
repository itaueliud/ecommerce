import React from "react";
import { Link } from "react-router-dom";
import { categorySlug } from "../utils/catalog.js";

export default function CategoryRail({ categories, activeFilter }) {
  return (
    <aside className="category-rail" aria-label="Categories">
      <div className="category-head">
        <h2>Categories</h2>
      </div>
      <div className="category-list">
        {categories.map((category) => {
          const name = typeof category === "string" ? category : category.name;
          return (
            <Link
              className={`category-item${activeFilter === name ? " active" : ""}`}
              key={name}
              to={`/categories/${categorySlug(name)}`}
            >
              <span className="category-name">
                <span className="category-dot" aria-hidden="true" />
                <span>{name}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
