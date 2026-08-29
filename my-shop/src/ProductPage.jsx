// src/ProductPage.jsx — Product detail page with stock indicator and add to cart
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchProduct, fetchRelatedProducts, addToWishlist, removeFromWishlist, fetchWishlist, subscribeStockNotification } from "./api";
import { useCart } from "./hooks/useCart";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import ReviewsSection from "./ReviewsSection";
import Breadcrumbs from "./Breadcrumbs";
import RecentlyViewed, { trackViewedProduct } from "./RecentlyViewed";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProduct(id)
      .then(data => {
        if (mounted) {
          setProduct(data);
          setLoading(false);
          // Track viewed product
          trackViewedProduct(data);
          // Check if product is in wishlist
          if (user) {
            fetchWishlist()
              .then(wishlistItems => {
                if (mounted) {
                  const isInWishlist = wishlistItems.some(item => item.product_id === parseInt(id));
                  setInWishlist(isInWishlist);
                }
              })
              .catch(() => {}); // Silent fail for wishlist check
          }
        }
      })
      .catch(err => { if (mounted) { setError(err.message); setLoading(false); } });
    return () => { mounted = false; };
  }, [id, user]);

  // Fetch related products
  useEffect(() => {
    fetchRelatedProducts(id, 4)
      .then(items => setRelated(Array.isArray(items) ? items : []))
      .catch(() => setRelated([]));
  }, [id]);

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:3000${url}`;
  };

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await addToCart(product);
      addToast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      addToast('Please sign in to use wishlist', 'error');
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        setInWishlist(false);
        addToast(`${product.name} removed from wishlist`, 'success');
      } else {
        await addToWishlist(product.id);
        setInWishlist(true);
        addToast(`${product.name} added to wishlist!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update wishlist', 'error');
    }
  };

  const handleSubscribeStock = async (e) => {
    e.preventDefault();
    if (subscribing) return;
    setSubscribing(true);
    try {
      await subscribeStockNotification(product.id, notifyEmail);
      setSubscribed(true);
      addToast("You'll be notified when this is back in stock!", 'success');
    } catch (err) {
      addToast(err.message || 'Failed to subscribe', 'error');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading product..." />;
  if (error) return <div style={{ textAlign: 'center', padding: 80 }}><p style={{ color: 'red' }}>Error: {error}</p><button className="back-btn" onClick={() => navigate(-1)}>← Go back</button></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>Product not found.</div>;

  const inStock = product.stock > 0;
  const imgUrl = getImageUrl(product.image);

  return (
    <div className="product-detail">
      <Breadcrumbs items={[
        { to: "/", label: "Home" },
        { to: "/products", label: "Products" },
        ...(product.category ? [{
          to: `/products?category=${product.category}`,
          label: product.category.charAt(0).toUpperCase() + product.category.slice(1),
          capitalize: true
        }] : []),
        { label: product.name }
      ]} />
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Store</button>

      {/* Image Gallery */}
      <div style={{ position: 'relative' }}>
        {imgUrl && !imageError ? (
          <img
            src={imgUrl}
            alt={product.name}
            style={{ width: '100%', maxWidth: 400, borderRadius: 12, marginBottom: 24 }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            width: '100%', maxWidth: 400, aspectRatio: '1/1', margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 100, background: '#f1f5f9', borderRadius: 16
          }}>
            {product.emoji || '🛍️'}
          </div>
        )}

        {/* Stock indicator */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: inStock ? (product.stock < 5 ? '#f59e0b' : '#22c55e') : '#ef4444',
          color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
        }}>
          {inStock ? `${product.stock} in stock` : 'Out of stock'}
        </div>
      </div>

      <h1>{product.name}</h1>
      {product.category && <span className="category-badge" style={{ marginBottom: 16 }}>{product.category}</span>}
      <p className="desc">{product.description}</p>
      <p className="price">${parseFloat(product.price).toFixed(2)}</p>

      {/* Enhanced stock indicator */}
      <div style={{ marginBottom: 16 }}>
        {inStock ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: product.stock < 5 ? '#fef3c7' : '#dcfce7',
            color: product.stock < 5 ? '#92400e' : '#166534',
            fontWeight: 600,
            fontSize: 13
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: product.stock < 5 ? '#f59e0b' : '#22c55e'
            }} />
            {product.stock < 5 ? `⚠️ Only ${product.stock} left!` : `${product.stock} in stock`}
          </div>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: '#fef2f2',
            color: '#991b1b',
            fontWeight: 600,
            fontSize: 13
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            Out of Stock
          </div>
        )}
      </div>

      {inStock ? (
        <button
          className="btn-primary"
          style={{ width: '100%', maxWidth: 300, opacity: adding ? 0.6 : 1 }}
          disabled={adding}
          onClick={handleAddToCart}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      ) : subscribed ? (
        <div style={{
          padding: '16px 24px',
          background: '#dcfce7',
          borderRadius: 12,
          color: '#166534',
          fontWeight: 600,
          maxWidth: 300
        }}>
          ✓ We'll notify you when back in stock!
        </div>
      ) : (
        <form onSubmit={handleSubscribeStock} style={{ maxWidth: 300, width: '100%' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={notifyEmail}
              onChange={e => setNotifyEmail(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14
              }}
            />
            <button
              type="submit"
              disabled={subscribing}
              style={{
                padding: '10px 16px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: subscribing ? 0.6 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              {subscribing ? '...' : 'Notify Me'}
            </button>
          </div>
        </form>
      )}

{/* Wishlist heart button */}
{user && (
  <button
    className="btn-wishlist"
    style={{
      width: 48,
      height: 48,
      border: '2px solid #e2e8f0',
      borderRadius: '50%',
      background: inWishlist ? '#ef4444' : 'transparent',
      color: inWishlist ? 'white' : '#64748b',
      fontSize: 20,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    }}
    onClick={handleToggleWishlist}
    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
  >
    {inWishlist ? '♥' : '♡'}
  </button>
)}

    {/* Related Products */}
    {related.length > 0 && (
      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>You Might Also Like</h2>
        <div className="product-grid">
          {related.map((item, index) => (
            <div key={item.id} className="product-card" style={{ animationDelay: `${index * 0.06}s` }}>
              <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                {getImageUrl(item.image) ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="product-image"
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '1/1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 48, background: '#f1f5f9', borderRadius: 8, marginBottom: 12
                  }}>
                    {item.emoji || '🛍️'}
                  </div>
                )}
                <p className="name" style={{ fontSize: 15 }}>{item.name}</p>
                <p className="price" style={{ fontSize: 16 }}>${parseFloat(item.price).toFixed(2)}</p>
                <span className="category-badge">{item.category || 'General'}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Reviews */}
    <ReviewsSection productId={id} />

    {/* Recently Viewed */}
    <RecentlyViewed currentProductId={id} />
  </div>
  );
}