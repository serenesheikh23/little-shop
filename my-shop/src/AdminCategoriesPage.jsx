// src/AdminCategoriesPage.jsx — Admin category management with API calls
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "./api";

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // { id, name }
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
    } catch {
      addToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (user) load(); }, [user]);

  if (authLoading) return <p style={{ padding: 24, color: "#64748b" }}>Verifying access...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = editing ? editing.newName : newName;
    if (!name.trim()) return;

    try {
      if (editing) {
        await updateCategory(editing.id, name.trim());
        addToast("Category updated!", "success");
      } else {
        await createCategory(name.trim());
        addToast("Category created!", "success");
      }
      setNewName("");
      setEditing(null);
      load();
    } catch (err) {
      addToast(err.message || "Failed to save category", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? Products in this category will lose their category.`)) return;
    try {
      await deleteCategory(id);
      addToast(`"${name}" deleted`, "warning");
      load();
    } catch (err) {
      addToast(err.message || "Failed to delete", "error");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Manage Categories</h2>
        <Link to="/admin" style={{
          padding: "8px 16px", background: "var(--bg-soft)", borderRadius: 8,
          textDecoration: "none", color: "var(--text-main)", fontSize: 13, fontWeight: 500
        }}>
          ← Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={editing ? editing.newName : newName}
          onChange={e => editing
            ? setEditing({ ...editing, newName: e.target.value })
            : setNewName(e.target.value)
          }
          placeholder="Category name"
          style={{ flex: 1, padding: 10, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }}
          required
        />
        <button type="submit" style={{
          padding: "10px 20px", background: "#3b82f6", color: "white",
          border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14
        }}>
          {editing ? "Save" : "Add"}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setNewName(""); }}
            style={{ padding: "10px 16px", border: "1px solid var(--border-light)", borderRadius: 8, cursor: "pointer", background: "var(--bg-card)" }}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading...</p>
      ) : categories.length === 0 ? (
        <p style={{ color: "#64748b" }}>No categories yet. Add one above!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {categories.map(c => (
            <div key={c.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: "var(--bg-card)", borderRadius: 8,
              border: "1px solid var(--border-light)"
            }} className="admin-card">
              <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{c.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setEditing({ id: c.id, newName: c.name }); setNewName(""); }}
                  style={{ padding: "4px 12px", border: "1px solid var(--border-light)", background: "var(--bg-card)", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(c.id, c.name)}
                  style={{ padding: "4px 12px", border: "none", background: "#dc2626", color: "white", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}