// src/ProductsPage.jsx — Product listing with search, category filter, pagination
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories, addToWishlist, removeFromWishlist, fetchWishlist, BASE_URL } from "./api";
import { useCart } from "./hooks/useCart";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import SearchAutocomplete from "./SearchAutocomplete";
import Breadcrumbs from "./Breadcrumbs";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [failedImages, setFailedImages] = useState({});
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const search = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      fetchWishlist()
        .then(items => {
          setWishlistIds(new Set(items.map(item => item.product_id)));
        })
        .catch(() => {});
    } else {
      setWishlistIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (search) params.search = search;
    if (categoryFilter && categoryFilter !== "all") params.category = categoryFilter;

    fetchProducts(params)
      .then((data) => {
        const items = Array.isArray(data) ? data : data.products || [];
        setProducts(items);
        if (data.totalPages) setPagination(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, categoryFilter, sort, page]);

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.delete("page");
    setSearchParams(params);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product);
      addToast(`${product.name} added to cart!`, "success");
    } catch (err) {
      addToast(err.message || "Failed to add to cart", "error");
    }
  };

  const toggleWishlistProduct = async product => {
    if (!user) {
      addToast('Please sign in to use wishlist', 'error');
      return;
    }
    try {
      if (wishlistIds.has(product.id)) {
        await removeFromWishlist(product.id);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        addToast(`${product.name} removed from wishlist`, 'success');
      } else {
        await addToWishlist(product.id);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.add(product.id);
          return next;
        });
        addToast(`${product.name} added to wishlist!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update wishlist', 'error');
    }
  };

  return (
    <div>
      <Breadcrumbs items={[
        { to: "/", label: "Home" },
        ...(categoryFilter && categoryFilter !== "all" ? [{
          to: "/products",
          label: "Products"
        }, {
          label: categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1),
          capitalize: true
        }] : [{ label: "All Products" }])
      ]} />

      {/* Search & Filter */}
      <div className="search-bar-container">
        <SearchAutocomplete />
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => updateParams("category", e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Results info & sort */}
      {!loading && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 16, flexWrap: "wrap", gap: 8
        }}>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Sort by:</label>
            <select
              value={sort}
              onChange={(e) => updateParams("sort", e.target.value)}
              className="filter-select"
              style={{ padding: "6px 12px", fontSize: 13 }}
            >
              <option value="newest">Newest</option>
              <option value="name">Name (A–Z)</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading products..." />
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
          No products found.
          <br />
          <button onClick={() => setSearchParams({})} className="btn-primary" style={{ marginTop: 16 }}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product, index) => (
              <div key={product.id} className="product-card" style={{ animationDelay: `${index * 0.06}s` }}>
                <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  {failedImages[product.id] || !getImageUrl(product.image) ? (
                    <div style={{
                      width: "100%", aspectRatio: "1/1",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 60, background: "#f1f5f9", borderRadius: 8, marginBottom: 16
                    }}>
                      {product.emoji || "🛍️"}
                    </div>
                  ) : (
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      onError={() => setFailedImages(prev => ({ ...prev, [product.id]: true }))}
                    />
                  )}
                  <p className="name">{product.name}</p>
                  <p className="price">${parseFloat(product.price).toFixed(2)}</p>
                  <span className="category-badge">{product.category || "General"}</span>
                  {/* Stock badge on card */}
                  {product.stock === 0 ? (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: '#ef4444',
                      marginTop: 6, letterSpacing: 0.5
                    }}>OUT OF STOCK</div>
                  ) : product.stock < 5 ? (
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: '#f59e0b',
                      marginTop: 6, letterSpacing: 0.5
                    }}>⚠ Only {product.stock} left</div>
                  ) : null}
                </Link>
                <button className="btn-wishlist-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlistProduct(product);
                  }}
                  title={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{ opacity: wishlistIds.has(product.id) ? 1 : 0.5 }}
                >
                  {wishlistIds.has(product.id) ? '♥' : '♡'}
                </button>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product, e);
                  }}
                  disabled={product.stock === 0}
                  style={{
                    background: product.stock === 0 ? '#94a3b8' : '#3b82f6',
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                    opacity: product.stock === 0 ? 0.6 : 1
                  }}
                >
                  {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
              <button
                className="btn-primary"
                style={{ padding: "8px 16px", opacity: page <= 1 ? 0.5 : 1 }}
                disabled={page <= 1}
                onClick={() => updateParams("page", String(page - 1))}
              >
                ← Previous
              </button>
              <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontWeight: 500 }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className="btn-primary"
                style={{ padding: "8px 16px", opacity: page >= pagination.totalPages ? 0.5 : 1 }}
                disabled={page >= pagination.totalPages}
                onClick={() => updateParams("page", String(page + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}