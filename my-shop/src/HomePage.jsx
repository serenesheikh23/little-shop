// src/HomePage.jsx — Hero banner, featured products, category navigation
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProducts, fetchCategories, addToWishlist, removeFromWishlist, fetchWishlist } from "./api";
import { useCart } from "./hooks/useCart";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import WhyChooseUs from "./WhyChooseUs";
import TrustBadges from "./TrustBadges";
import NewsletterSection from "./NewsletterSection";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchProducts({ limit: 8 }),
      fetchCategories()
    ]).then(([productsData, cats]) => {
      const prods = Array.isArray(productsData) ? productsData : productsData.products || [];
      setFeatured(prods);
      setCategories(cats || []);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:3000${url}`;
  };

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product);
      addToast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  const toggleWishlistProduct = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
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

  if (loading) {
    return <LoadingSpinner message="Loading featured products..." />;
  }

  return (
    <div>
      {/* Modern Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        borderRadius: 20,
        padding: '80px 40px',
        marginBottom: 48,
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(108, 99, 255, 0.3)'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.2)',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.2)',
          filter: 'blur(40px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 52,
            fontWeight: 900,
            marginBottom: 16,
            background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1
          }}>
            Welcome to Little Shop
          </h1>
          <p style={{
            fontSize: 20,
            opacity: 0.9,
            marginBottom: 36,
            maxWidth: 560,
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Discover curated products for your everyday life. Quality items at great prices, delivered to your door.
          </p>
          <Link to="/products"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 8px 24px rgba(108, 99, 255, 0.4)'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 32px rgba(108, 99, 255, 0.5)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 24px rgba(108, 99, 255, 0.4)';
            }}
          >
            Shop All Products →
          </Link>
        </div>
      </div>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Category Navigation */}
      {categories.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Shop by Category</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.name}`)}
                style={{
                  padding: '12px 28px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 50,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                  color: 'var(--text-main)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#6c63ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Featured Products</h2>
      <div className="product-grid">
        {featured.map((product, index) => (
          <div key={product.id} className="product-card" style={{ animationDelay: `${index * 0.06}s` }}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              {getImageUrl(product.image) ? (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '1/1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 60, background: 'var(--bg-soft)', borderRadius: 8, marginBottom: 16
                }}>
                  {product.emoji || '🛍️'}
                </div>
              )}
              <p className="name">{product.name}</p>
              <p className="price">${parseFloat(product.price).toFixed(2)}</p>
              <span className="category-badge">{product.category || 'General'}</span>
            </Link>
            <button className="btn" onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product, e);
              }}>
              Add to cart
            </button>
            <button className="btn-wishlist-small"
              onClick={(e) => toggleWishlistProduct(product, e)}
              title={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{ opacity: wishlistIds.has(product.id) ? 1 : 0.5 }}
            >
              {wishlistIds.has(product.id) ? '♥' : '♡'}
            </button>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
