// src/NewsletterSection.jsx — Newsletter signup for homepage
import { useState } from "react";
import { useToast } from "./hooks/useToast";

export default function NewsletterSection() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      addToast("Please enter a valid email", "error");
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    addToast("Welcome! Check your email for a special offer.", "success");
    setEmail("");
    setSubmitting(false);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #6c63ff 0%, #8b5cf6 50%, #3b82f6 100%)",
      borderRadius: "var(--radius-card)",
      padding: "48px 32px",
      color: "white",
      textAlign: "center",
      margin: "48px 0",
      boxShadow: "0 10px 30px rgba(108, 99, 255, 0.3)"
    }}>
      <p style={{ fontSize: 40, marginBottom: 8 }}>📬</p>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Join Our Newsletter
      </h2>
      <p style={{ fontSize: 16, opacity: 0.95, maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>
        Subscribe to get exclusive offers, new product alerts, and 10% off your first order.
      </p>

      <form onSubmit={handleSubmit} style={{
        display: "flex",
        gap: 8,
        maxWidth: 460,
        margin: "0 auto",
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            flex: 1,
            minWidth: 220,
            padding: "12px 16px",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            background: "white",
            color: "#1e293b"
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "12px 24px",
            background: "rgba(0,0,0,0.2)",
            border: "2px solid white",
            color: "white",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
            transition: "all 0.2s",
            opacity: submitting ? 0.6 : 1
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.2)"}
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      <p style={{ fontSize: 12, opacity: 0.85, marginTop: 12 }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
