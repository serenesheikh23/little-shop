// src/ProfilePage.jsx — User profile with order history
import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";
import { fetchProfile, updateProfile, fetchOrders } from "./api";
import LoadingSpinner from "./LoadingSpinner";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchProfile(),
      fetchOrders()
    ]).then(([profileData, ordersData]) => {
      setProfile(profileData);
      setEmail(profileData.email || "");
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (authLoading) return <LoadingSpinner message="Verifying access..." />;
  if (!user) return <Navigate to="/login" replace />;

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(email);
      addToast("Profile updated!", "success");
    } catch (err) {
      addToast(err.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Profile Card */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32,
        border: "1px solid #e2e8f0", marginBottom: 32,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#3b82f6", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 22 }}>{profile?.username || user.username}</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
            </p>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 500,
              background: profile?.role === "admin" ? "#fef3c7" : "#f1f5f9",
              color: profile?.role === "admin" ? "#92400e" : "#64748b",
              padding: "2px 10px", borderRadius: 50, marginTop: 4
            }}>
              {profile?.role || "user"}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateEmail} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: "100%", padding: 10, border: "1px solid #e2e8f0",
                borderRadius: 8, fontSize: 14
              }}
            />
          </div>
          <button type="submit" disabled={saving}
            style={{
              padding: "10px 24px", background: "#3b82f6", color: "white",
              border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
              opacity: saving ? 0.6 : 1, whiteSpace: "nowrap"
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      {/* Order History */}
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Order History</h2>
      {orders.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 12, padding: 32,
          border: "1px solid #e2e8f0", textAlign: "center"
        }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>📦</p>
          <p style={{ color: "#64748b", marginBottom: 16 }}>No orders yet</p>
          <Link to="/products" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{
            background: "#fff", borderRadius: 12, padding: 20,
            border: "1px solid #e2e8f0", marginBottom: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <strong>Order #{order.id}</strong>
                <span style={{
                  display: "inline-block", marginLeft: 12, fontSize: 12,
                  background: order.status === "delivered" ? "#dcfce7" : order.status === "shipped" ? "#dbeafe" : "#f1f5f9",
                  color: order.status === "delivered" ? "#166534" : order.status === "shipped" ? "#1e40af" : "#64748b",
                  padding: "2px 10px", borderRadius: 50, textTransform: "capitalize"
                }}>
                  {order.status}
                </span>
              </div>
              <span style={{ color: "#64748b", fontSize: 13 }}>
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric"
                })}
              </span>
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "3px 0" }}>
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "right", fontWeight: 700, fontSize: 18, color: "#3b82f6", marginTop: 12 }}>
              Total: ${parseFloat(order.total).toFixed(2)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}