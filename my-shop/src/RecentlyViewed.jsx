// src/RecentlyViewed.jsx — Shows products the user has recently viewed
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "./api";

const STORAGE_KEY = "recently_viewed";
const MAX_ITEMS = 8;

function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function trackViewedProduct(product) {
  if (!product) return;
  const items = getRecentlyViewed();
  // Remove if already exists
  const filtered = items.filter(p => p.id !== product.id);
  // Add to front
  filtered.unshift({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    emoji: product.emoji,
    category: product.category
  });
  // Cap at MAX_ITEMS
  const trimmed = filtered.slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export default function RecentlyViewed({ currentProductId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const all = getRecentlyViewed();
    // Filter out current product and ensure unique IDs
    const filtered = all.filter(p => p.id !== currentProductId);
    setItems(filtered.slice(0, 4));
  }, [currentProductId]);

  if (items.length === 0) return null;

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Recently Viewed</h2>
      <div className="product-grid">
        {items.map((product, index) => (
          <div key={product.id} className="product-card" style={{ animationDelay: `${index * 0.06}s` }}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              {getImageUrl(product.image) ? (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
              ) : (
                <div style={{
                  width: "100%", aspectRatio: "1/1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 48, background: "var(--bg-soft)", borderRadius: 8, marginBottom: 12
                }}>
                  {product.emoji || "🛍️"}
                </div>
              )}
              <p className="name" style={{ fontSize: 15 }}>{product.name}</p>
              <p className="price" style={{ fontSize: 16 }}>${parseFloat(product.price).toFixed(2)}</p>
              <span className="category-badge">{product.category || "General"}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
