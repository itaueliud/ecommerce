import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryRail from "../components/CategoryRail.jsx";
import ProductCard from "../components/ProductCard.jsx";
import PromoGrid from "../components/PromoGrid.jsx";
import ServicePanel from "../components/ServicePanel.jsx";
import { targetCategories } from "../data/catalog.js";
import { categorySlug, formatMoney, getStockLeft } from "../utils/catalog.js";

const kenyaCounties = [
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Nakuru",
  "Kisumu",
  "Uasin Gishu",
  "Machakos",
  "Kajiado",
  "Meru",
  "Nyeri",
  "Kilifi",
  "Kakamega"
];

function categoryId(category) {
  return `category-${categorySlug(category)}`;
}

function StarRating({ rating = 4.2 }) {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <span className="star-rating detail-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <span className={star <= roundedRating ? "filled" : ""} key={star}>
          ★
        </span>
      ))}
    </span>
  );
}

function ProductDetail({ product, onClose, onAdd }) {
  const [selectedCounty, setSelectedCounty] = useState("Nairobi");

  if (!product) return null;

  const stockLeft = getStockLeft(product);
  const rating = product.rating || 4.2;
  const deliveryEstimate = ["Nairobi", "Kiambu", "Machakos", "Kajiado"].includes(selectedCounty)
    ? "Same day or next day dispatch"
    : "1-3 business days after supplier confirmation";
  const description =
    product.description ||
    `${product.brand || "This supplier"} offers ${product.name} for bulk buying, resale, and institutional procurement.`;
  const ingredients =
    product.ingredients ||
    product.contents ||
    "Product composition details will be confirmed by the supplier before fulfillment.";
  const details = product.details || [
    `Packed as ${product.unit_size || product.unit || "bulk units"}`,
    "Suitable for wholesale, retail, office, hotel, restaurant, or institutional orders",
    "Availability can change based on supplier stock and delivery location"
  ];
  const contents = Array.isArray(product.contents) ? product.contents : [];

  return (
    <div className="product-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" aria-label="Close product details" onClick={onClose}>
          x
        </button>
        <img src={product.image} alt={product.name} />
        <div className="product-detail-body">
          <span className="product-breadcrumb">Danaba FMCG / {product.category}</span>
          <h2 id="product-detail-title">{product.name}</h2>
          <p>{description}</p>
          <div className="product-detail-price">
            <strong>{formatMoney(product.price)}</strong>
            <span>{formatMoney(product.oldPrice)}</span>
          </div>
          <div className="product-detail-grid">
            <div>
              <span>Units left</span>
              <strong>{stockLeft}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{product.category}</strong>
            </div>
            <div>
              <span>Package</span>
              <strong>{product.unit_size || product.unit || "Bulk"}</strong>
            </div>
            <div>
              <span>Rating</span>
              <strong className="detail-rating">
                <StarRating rating={rating} />
                {rating}/5
              </strong>
            </div>
          </div>
          <div className="product-info-block">
            <h3>Ingredients / contents</h3>
            <p>{Array.isArray(ingredients) ? ingredients.join(", ") : ingredients}</p>
          </div>
          {contents.length > 0 && (
            <div className="product-info-block">
              <h3>Assortment included</h3>
              <ul>
                {contents.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="product-info-block">
            <h3>More product information</h3>
            <ul>
              {details.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="product-info-block delivery-block">
            <h3>Delivery</h3>
            <label>
              Choose county
              <select value={selectedCounty} onChange={(event) => setSelectedCounty(event.target.value)}>
                {kenyaCounties.map((county) => (
                  <option value={county} key={county}>
                    {county}
                  </option>
                ))}
              </select>
            </label>
            <p>{deliveryEstimate} to {selectedCounty}. Final fee is confirmed at checkout.</p>
          </div>
          <button className="add-button" type="button" onClick={() => onAdd(product._id)}>
            Add to cart
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Marketplace({
  categories,
  products,
  activeFilter,
  setActiveFilter,
  searchTerm,
  setSearchTerm,
  onAddToCart,
  selectedCategory = ""
}) {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const query = searchTerm.trim().toLowerCase();

  const sectionCategories = [
    ...targetCategories,
    ...categories.filter((category) => !targetCategories.includes(category) && products.some((product) => product.category === category))
  ];

  useEffect(() => {
    setActiveFilter(selectedCategory);
  }, [selectedCategory, setActiveFilter]);

  function productMatchesSearch(product) {
    const text = `${product.name} ${product.brand || ""} ${product.category} ${product.unit_size || ""}`.toLowerCase();
    return !query || text.includes(query);
  }

  function productsForCategory(category) {
    return products.filter((product) => {
      const matchesCategory = product.category === category || product.tags?.includes(category);
      return matchesCategory && productMatchesSearch(product);
    });
  }

  function clearFilters() {
    setActiveFilter("");
    setSearchTerm("");
    if (selectedCategory) {
      navigate("/");
      return;
    }
    document.querySelector(`#${categoryId(targetCategories[0])}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const visibleSections = sectionCategories
    .filter((category) => !selectedCategory || category === selectedCategory)
    .map((category) => ({ category, products: productsForCategory(category) }))
    .filter((section) => section.products.length);

  return (
    <main>
      <section className="market-shell container" aria-label="Shopping highlights">
        <CategoryRail categories={sectionCategories} activeFilter={activeFilter} />

        <section className="hero-carousel" aria-label="Featured offers">
          <div className="hero-copy">
            <span className="eyebrow">Danaba wholesale week</span>
            <h1>Stock up faster with trusted FMCG suppliers.</h1>
            <p>Compare prices, order cartons or packs, and arrange delivery from verified distributors near you.</p>
            <div className="hero-actions">
              <a href={`#${categoryId(targetCategories[0])}`} className="primary-link">
                Shop categories
              </a>
              <a href="/suppliers" className="secondary-link">
                Find suppliers
              </a>
            </div>
          </div>
          <div className="hero-media" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
              alt=""
            />
          </div>
        </section>

        <ServicePanel />
      </section>

      <div className="category-sections">
        {visibleSections.length ? (
          visibleSections.map((section) => (
            <section className="content-row container category-section" id={categoryId(section.category)} key={section.category}>
              <div className="section-heading">
                <div>
                  <span>Danaba FMCG / {section.category}</span>
                  <h2>{section.category}</h2>
                </div>
                <button type="button" onClick={clearFilters}>
                  See all
                </button>
              </div>
              <div className="product-grid">
                {section.products.map((product) => (
                  <ProductCard product={product} onAdd={onAddToCart} onView={setSelectedProduct} key={product._id} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <section className="content-row container category-section">
            <div className="section-heading">
              <h2>No products found</h2>
              <button type="button" onClick={clearFilters}>
                See all
              </button>
            </div>
            <p>Try another search term or browse the main FMCG categories.</p>
          </section>
        )}
      </div>

      <PromoGrid />
      <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={onAddToCart} />
    </main>
  );
}
