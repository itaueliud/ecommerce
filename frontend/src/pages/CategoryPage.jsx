import React from "react";
import { Navigate, useParams } from "react-router-dom";
import Marketplace from "./Marketplace.jsx";
import { categoryFromSlug } from "../utils/catalog.js";

export default function CategoryPage(props) {
  const { categorySlug } = useParams();
  const selectedCategory = categoryFromSlug(props.categories, categorySlug);

  if (!selectedCategory) return <Navigate to="/" replace />;

  return <Marketplace {...props} selectedCategory={selectedCategory} />;
}
