// src/RegisterPage.jsx — User registration with validation
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim()) return setError("Username is required");
    if (form.username.length < 3) return setError("Username must be at least 3 characters");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim() || null, form.password);
      addToast("Account created! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 420, margin: "60px auto",
      background: "#fff", padding: 40, borderRadius: 16,
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
    }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 40, marginBottom: 8 }}>📝</p>
        <h2 style={{ fontSize: 24 }}>Create Account</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Join Little Shop today</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input type="text" placeholder="Username" value={form.username} onChange={handleChange("username")}
          style={{ padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} required autoFocus />
        <input type="email" placeholder="Email (optional)" value={form.email} onChange={handleChange("email")}
          style={{ padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
        <input type="password" placeholder="Password (6+ characters)" value={form.password} onChange={handleChange("password")}
          style={{ padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} required />
        <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange("confirmPassword")}
          style={{ padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} required />
        {error && <p style={{ color: "#ef4444", textAlign: "center", fontSize: 14, background: "#fef2f2", padding: 8, borderRadius: 6 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{
            padding: 12, border: "none", borderRadius: 8,
            background: loading ? "#93c5fd" : "#3b82f6", color: "white",
            fontWeight: 600, cursor: "pointer", fontSize: 15
          }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
      </p>
    </div>
  );
}