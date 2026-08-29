// src/AdminOrdersPage.jsx — Admin order management with status updates
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";
import { fetchAdminOrders, updateOrderStatus } from "./api";
import LoadingSpinner from "./LoadingSpinner";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await fetchAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast(`Order #${orderId} status updated to ${newStatus}`, "success");
      loadOrders();
    } catch (err) {
      addToast(err.message || "Failed to update status", "error");
    }
  };

  if (authLoading) return <LoadingSpinner message="Verifying access..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f1f5f9", confirmed: "#dbeafe", shipped: "#fef3c7",
      delivered: "#dcfce7", cancelled: "#fef2f2"
    };
    const textColors = {
      pending: "#64748b", confirmed: "#1e40af", shipped: "#92400e",
      delivered: "#166534", cancelled: "#991b1b"
    };
    return { bg: colors[status] || "#f1f5f9", text: textColors[status] || "#64748b" };
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24 }}>Order Management</h2>
        <Link to="/admin" className="btn-primary" style={{ textDecoration: "none", fontSize: 13, padding: "8px 16px" }}>
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-light)" }} className="admin-card">
          <p style={{ fontSize: 48, marginBottom: 8 }}>📋</p>
          <p style={{ color: "#64748b" }}>No orders yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => {
            const sc = getStatusColor(order.status);
            return (
              <div key={order.id} style={{
                background: "var(--bg-card)", borderRadius: 12, padding: 20,
                border: "1px solid var(--border-light)"
              }} className="admin-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <strong>Order #{order.id}</strong>
                    <span style={{ marginLeft: 8, fontSize: 13, color: "#64748b" }}>
                      by {order.username || "Guest"}
                    </span>
                    <span style={{
                      marginLeft: 8, fontSize: 12, padding: "2px 10px", borderRadius: 50,
                      background: sc.bg, color: sc.text, textTransform: "capitalize"
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                    <select
                      value={order.status}
                      onChange={e => handleStatus(order.id, e.target.value)}
                      style={{
                        padding: "6px 10px", border: "1px solid #e2e8f0",
                        borderRadius: 6, fontSize: 12, cursor: "pointer"
                      }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Customer info */}
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                  {order.customer_name} — {order.customer_email}
                  <br />{order.customer_address}
                </div>

                {/* Items */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: 14, padding: "3px 0"
                    }}>
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "right", fontWeight: 700, fontSize: 18, color: "#3b82f6", marginTop: 8 }}>
                  Total: ${parseFloat(order.total).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}