// src/WishlistPage.jsx — Wishlist page for logged-in users
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWishlist, removeFromWishlist } from "./api";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";
import LoadingSpinner from "./LoadingSpinner";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch wishlist
    fetchWishlist()
      .then(items => {
        setWishlistItems(items);
        setLoading(false);
      })
      .catch(err => {
        addToast("Failed to load wishlist", "error");
        setLoading(false);
      });
  }, [user, authLoading, navigate, addToast]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item.product_id !== productId));
      addToast("Item removed from wishlist", "success");
    } catch (err) {
      addToast("Failed to remove from wishlist", "error");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:3000${url}`;
  };

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <div style={{ textAlign: 'center', padding: 80 }}>Please sign in to view your wishlist</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Wishlist</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          Save your favorite items for later
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading wishlist..." />
      ) : wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <p>Your wishlist is empty</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {wishlistItems.map((item, index) => (
              <div key={item.id} className="product-card" style={{ animationDelay: `${index * 0.06}s` }}>
                <Link to={`/product/${item.product_id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  {item.image && !item.image.startsWith('data:image') ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="product-image"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to emoji if image fails
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", aspectRatio: "1/1",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 60, background: "#f1f5f9", borderRadius: 8, marginBottom: 16
                    }}>
                      {item.emoji || "🛍️"}
                    </div>
                  )}
                  <p className="name">{item.name}</p>
                  <p className="price">${parseFloat(item.price).toFixed(2)}</p>
                  <span className="category-badge">{item.category || "General"}</span>
                </Link>
                <div className="wishlist-actions">
                  <button
                    className="btn"
                    onClick={() => handleRemove(item.product_id)}
                    style={{ background: '#ef4444' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}