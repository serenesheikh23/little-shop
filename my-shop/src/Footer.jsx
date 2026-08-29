// src/Footer.jsx — Professional site footer
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "./hooks/useToast";

export default function Footer() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      addToast("Please enter a valid email", "error");
      return;
    }
    setSubscribing(true);
    await new Promise(r => setTimeout(r, 600));
    addToast("Subscribed! Check your inbox for a welcome email.", "success");
    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer style={{
      background: "var(--bg-card)",
      borderTop: "1px solid var(--border-light)",
      marginTop: 60,
      padding: "48px 0 24px"
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 40,
          marginBottom: 40
        }}>
          {/* Brand */}
          <div>
            <h3 style={{
              fontSize: 22, fontWeight: 800, marginBottom: 12,
              color: "var(--text-main)"
            }}>
              🏪 <span style={{ color: "var(--primary-blue)" }}>Little Shop</span>
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
              Quality products for everyday life. Curated, tested, and delivered to your door.
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { name: "Facebook", icon: "f" },
                { name: "Instagram", icon: "📷" },
                { name: "Twitter", icon: "𝕏" },
                { name: "YouTube", icon: "▶" },
                { name: "TikTok", icon: "♪" }
              ].map(social => (
                <button
                  key={social.name}
                  aria-label={social.name}
                  title={social.name}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "var(--bg-soft)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 16, fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--primary-blue)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "var(--primary-blue)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-soft)";
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.borderColor = "var(--border-light)";
                  }}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Quick Links
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/contact" label="Contact" />
              <FooterLink to="/faq" label="FAQ" />
              <FooterLink to="/products" label="Shop All" />
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Customer Service
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FooterLink to="/privacy" label="Privacy Policy" />
              <FooterLink to="/terms" label="Terms & Conditions" />
              <FooterLink to="/profile" label="My Account" />
              <FooterLink to="/profile" label="Order History" />
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Stay Updated
            </h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            <form onSubmit={handleNewsletter} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "var(--bg-card)",
                  color: "var(--text-main)"
                }}
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary"
                style={{
                  padding: 10, fontSize: 13, fontWeight: 600,
                  opacity: subscribing ? 0.6 : 1
                }}
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Little Shop. All rights reserved.
          </p>

          {/* Payment methods */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}>We accept:</span>
            {["💳 Visa", "💳 Mastercard", "🅿 PayPal", "🍎 Apple Pay"].map(method => (
              <span
                key={method}
                style={{
                  padding: "4px 10px",
                  background: "var(--bg-soft)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 500
                }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, label }) {
  return (
    <Link
      to={to}
      style={{
        color: "var(--text-muted)",
        textDecoration: "none",
        fontSize: 14,
        transition: "color 0.2s"
      }}
      onMouseEnter={e => e.currentTarget.style.color = "var(--primary-blue)"}
      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
    >
      {label}
    </Link>
  );
}
