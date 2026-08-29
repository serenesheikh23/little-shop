// src/LoginPage.jsx — Login with JWT (redirects based on role)
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      addToast(`Welcome back, ${data.user.username}!`, "success");
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message || "Invalid username or password");
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
        <p style={{ fontSize: 40, marginBottom: 8 }}>🔐</p>
        <h2 style={{ fontSize: 24 }}>Welcome Back</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <input
          type="text" placeholder="Username"
          value={username} onChange={e => setUsername(e.target.value)}
          style={{ padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }}
          required autoFocus
        />
        <input
          type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          style={{ padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14 }}
          required
        />
        {error && <p style={{ color: "#ef4444", textAlign: "center", fontSize: 14, background: "#fef2f2", padding: 8, borderRadius: 6 }}>{error}</p>}
        <button
          type="submit" disabled={loading}
          style={{
            padding: 12, border: "none", borderRadius: 8,
            background: loading ? "#93c5fd" : "#3b82f6", color: "white",
            fontWeight: 600, cursor: "pointer", fontSize: 15
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>Sign up</Link>
      </p>
      <p style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
        Demo: admin/password or demo/password
      </p>
    </div>
  );
}