// src/AdminPage.jsx — Admin Dashboard (products CRUD + stats)
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";
import { fetchProducts, fetchCategories, createProduct, updateProduct, deleteProduct, fetchAdminStats, BASE_URL } from "./api";
import LoadingSpinner from "./LoadingSpinner";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    name: "", price: "", emoji: "", description: "", stock: "10", category_id: ""
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchAdminStats()
    ]).then(([prods, cats, adminStats]) => {
      setProducts(Array.isArray(prods) ? prods : prods.products || []);
      setCategories(cats || []);
      setStats(adminStats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (authLoading) return <LoadingSpinner message="Verifying access..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("emoji", form.emoji);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("category_id", form.category_id);
    if (file) {
      formData.append("image", file);
    } else if (editingId && form.image) {
      formData.append("existingImage", form.image);
    }

    try {
      if (editingId) {
        await updateProduct(editingId, formData);
        addToast("Product updated!", "success");
      } else {
        await createProduct(formData);
        addToast("Product created!", "success");
      }
      // Refresh
      const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(Array.isArray(prods) ? prods : prods.products || []);
      setCategories(cats || []);
      resetForm();
    } catch (err) {
      addToast(err.message || "Failed to save product", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      addToast("Product deleted", "warning");
      const [prods] = await Promise.all([fetchProducts()]);
      setProducts(Array.isArray(prods) ? prods : prods.products || []);
    } catch (err) {
      addToast(err.message || "Failed to delete", "error");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      emoji: product.emoji || "",
      description: product.description || "",
      stock: String(product.stock ?? 10),
      category_id: product.category_id ? String(product.category_id) : "",
      image: product.image || ""
    });
    setFile(null);
    setEditingId(product.id);
  };

  const resetForm = () => {
    setForm({ name: "", price: "", emoji: "", description: "", stock: "10", category_id: "", image: "" });
    setFile(null);
    setEditingId(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24 }}>Admin Dashboard</h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Logged in as <strong>{user.username}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/admin/orders" className="btn-primary" style={{ textDecoration: "none", fontSize: 13, padding: "8px 16px" }}>
            Orders
          </Link>
          <Link to="/admin/categories" style={{
            padding: "8px 16px", background: "var(--bg-soft)", borderRadius: 8,
            textDecoration: "none", color: "var(--text-main)", fontSize: 13, fontWeight: 500
          }}>
            Categories
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16, marginBottom: 32
        }}>
          {[
            { label: "Products", value: stats.totalProducts, color: "#3b82f6", icon: "📦" },
            { label: "Orders", value: stats.totalOrders, color: "#22c55e", icon: "📋" },
            { label: "Users", value: stats.totalUsers, color: "#8b5cf6", icon: "👥" },
            { label: "Revenue", value: `$${parseFloat(stats.totalRevenue).toFixed(0)}`, color: "#f59e0b", icon: "💰" },
            { label: "Low Stock", value: stats.lowStock, color: stats.lowStock > 0 ? "#ef4444" : "#64748b", icon: "⚠️" },
          ].map(s => (
            <div key={s.label} className="admin-card" style={{
              background: "var(--bg-card)", borderRadius: 12, padding: 20,
              border: "1px solid var(--border-light)", textAlign: "center"
            }}>
              <p style={{ fontSize: 24, margin: 0 }}>{s.icon}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: "4px 0" }}>{s.value}</p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Product Form */}
      <form onSubmit={handleSubmit} style={{
        background: "var(--bg-card)", borderRadius: 12, padding: 24, marginBottom: 32,
        border: "1px solid var(--border-light)", boxShadow: "var(--shadow-soft)"
      }} className="admin-card">
        <h3 style={{ marginBottom: 16 }}>{editingId ? "Edit Product" : "Add New Product"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input placeholder="Product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="admin-input" style={{ padding: 10, border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 14, background: "var(--input-bg)", color: "var(--text-main)" }} required />
          <input placeholder="Price" type="number" step="0.01" min="0" value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
            className="admin-input" style={{ padding: 10, border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 14, background: "var(--input-bg)", color: "var(--text-main)" }} required />
          <input placeholder="Emoji (e.g. 👜)" value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})}
            className="admin-input" style={{ padding: 10, border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 14, background: "var(--input-bg)", color: "var(--text-main)" }} />
          <input placeholder="Stock quantity" type="number" min="0" value={form.stock}
            onChange={e => setForm({...form, stock: e.target.value})}
            className="admin-input" style={{ padding: 10, border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 14, background: "var(--input-bg)", color: "var(--text-main)" }} />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          rows={2} className="admin-input" style={{ width: "100%", padding: 10, border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 14, marginTop: 12, resize: "vertical", fontFamily: "inherit", background: "var(--input-bg)", color: "var(--text-main)" }} />
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
              style={{ padding: 8, fontSize: 13, color: "var(--text-main)" }} />
            {form.image && !file && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Current: {form.image.substring(0, 30)}</p>}
          </div>
          <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
            className="admin-input" style={{ padding: 10, border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 14, minWidth: 140, background: "var(--input-bg)", color: "var(--text-main)" }}>
            <option value="">No category</option>
            {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" style={{
            flex: 1, padding: 12, background: "#3b82f6", color: "white",
            border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14
          }}>
            {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={{
              padding: "12px 24px", background: "var(--bg-soft)",
              border: "1px solid var(--border-light)", borderRadius: 8, cursor: "pointer", color: "var(--text-main)"
            }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Product List */}
      <h3 style={{ marginBottom: 16 }}>Products ({products.length})</h3>
      {products.length === 0 ? (
        <p style={{ color: "#64748b" }}>No products yet. Add one above!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {products.map(p => {
            const imgUrl = getImageUrl(p.image);
            return (
              <div key={p.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "var(--bg-card)", padding: 12, borderRadius: 8,
                border: "1px solid var(--border-light)"
              }} className="admin-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.name} style={{
                      width: 40, height: 40, borderRadius: 6, objectFit: "cover"
                    }} />
                  ) : (
                    <span style={{ fontSize: 24 }}>{p.emoji || "🛍️"}</span>
                  )}
                  <div>
                    <strong>{p.name}</strong>
                    <span style={{ marginLeft: 8, color: "var(--text-muted)", fontSize: 13 }}>
                      ${parseFloat(p.price).toFixed(2)}
                    </span>
                    {p.stock === 0 ? (
                      <span className="stock-badge stock-out" style={{ marginLeft: 8 }}>OUT OF STOCK</span>
                    ) : p.stock < 5 ? (
                      <span className="stock-badge stock-low" style={{ marginLeft: 8 }}>⚠ Only {p.stock} left</span>
                    ) : (
                      <span className="stock-badge stock-in" style={{ marginLeft: 8 }}>✓ In stock ({p.stock})</span>
                    )}
                    <span className="category-badge" style={{ marginLeft: 8 }}>
                      {p.category || "Uncategorized"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => handleEdit(p)} className="admin-edit-btn"
                    style={{ padding: "4px 12px", border: "1px solid var(--border-light)", background: "var(--bg-card)", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ padding: "4px 12px", border: "none", background: "#dc2626", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}