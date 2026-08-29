// src/CartPage.jsx — Shopping cart with quantity controls and checkout
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "./hooks/useCart";
import { useToast } from "./hooks/useToast";

export default function CartPage() {
  const { cartItems, changeQty, clearCart, total, itemCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleClear = () => {
    clearCart();
    addToast('Cart cleared', 'warning');
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
        <p style={{ fontSize: 20, color: '#64748b', marginBottom: 24 }}>Your cart is empty</p>
        <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24 }}>Shopping Cart ({itemCount} items)</h2>
        <button
          onClick={handleClear}
          style={{
            padding: '8px 16px', background: '#fee2e2', color: '#dc2626',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 13
          }}
        >
          Clear Cart
        </button>
      </div>

      {cartItems.map((item) => {
        const imgUrl = getImageUrl(item.product.image);
        return (
          <div key={item.product.id} className="cart-item">
            <div className="cart-item-info">
              {imgUrl ? (
                <img src={imgUrl} alt={item.product.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 28 }}>{item.product.emoji || '🛍️'}</span>
              )}
              <div>
                <Link to={`/product/${item.product.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
                  {item.product.name}
                </Link>
                <p style={{ fontSize: 13, color: '#64748b' }}>${parseFloat(item.product.price).toFixed(2)} each</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="cart-qty-btn" onClick={() => changeQty(item.product.id, -1)}>−</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
              <button className="cart-qty-btn" onClick={() => changeQty(item.product.id, 1)}>+</button>
              <span style={{ fontWeight: 700, minWidth: 70, textAlign: 'right', color: '#3b82f6' }}>
                ${(item.product.price * item.qty).toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}

      <div style={{
        background: '#fff', borderRadius: 12, padding: 20, marginTop: 24,
        border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
          <span>Subtotal ({itemCount} items)</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="cart-total" style={{ marginTop: 12 }}>
          Total: ${total.toFixed(2)}
        </div>
        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: 16, padding: 14, fontSize: 16 }}
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}