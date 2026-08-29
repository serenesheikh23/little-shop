// src/App.jsx — Main app with routing and navigation
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CartProvider } from "./CartContext.jsx";
import { useCart } from "./hooks/useCart";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import HomePage from "./HomePage";
import ProductsPage from "./ProductsPage";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ProfilePage from "./ProfilePage";
import AdminPage from "./AdminPage";
import AdminCategoriesPage from "./AdminCategoriesPage";
import AdminOrdersPage from "./AdminOrdersPage";
import WishlistPage from "./WishlistPage";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import FaqPage from "./FaqPage";
import PrivacyPage from "./PrivacyPage";
import TermsPage from "./TermsPage";
import Footer from "./Footer";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        width: 56,
        height: 28,
        borderRadius: 14,
        background: isDark
          ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
          : "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
        border: "none",
        cursor: "pointer",
        transition: "all 0.4s ease",
        boxShadow: isDark
          ? "0 0 12px rgba(139, 92, 246, 0.4), inset 0 2px 4px rgba(0,0,0,0.3)"
          : "0 0 12px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(0,0,0,0.1)"
      }}
    >
      <span style={{
        position: "absolute",
        top: 2,
        left: isDark ? 30 : 2,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }}>
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}

function NavBar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Link to="/">🏪 Little Shop</Link>
        <Link to="/products" className="nav-link">Products</Link>
        {!user?.role && (
          <>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/faq" className="nav-link">FAQ</Link>
          </>
        )}
        {user && user.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin</Link>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <ThemeToggle />
        {user ? (
          <>
            <Link to="/wishlist" className="nav-link">♥ Wishlist</Link>
            <Link to="/profile" className="nav-link">👤 {user.username}</Link>
            <button
              onClick={() => { logout(); window.location.href = "/"; }}
              className="btn-secondary"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, padding: '6px 16px' }}>
            Sign In
          </Link>
        )}
        <Link to="/cart" className="cart-link" style={{ fontSize: 14 }}>
          🛒 Cart ({itemCount})
        </Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="container" style={{ minHeight: "calc(100vh - 200px)" }}>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}
