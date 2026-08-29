// src/ContactPage.jsx — Contact Us page
import { useState } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { useToast } from "./hooks/useToast";

export default function ContactPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      addToast("Please fill in all required fields", "error");
      return;
    }
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    addToast("Message sent! We'll get back to you within 24 hours.", "success");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Breadcrumbs items={[
        { to: "/", label: "Home" },
        { label: "Contact Us" }
      ]} />

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
          Get in <span style={{ color: "var(--primary-blue)" }}>Touch</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto" }}>
          Have a question or feedback? We'd love to hear from you. Our team is here to help.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, alignItems: "start" }}>
        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-card)",
            padding: 24
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Contact Information</h3>

            <ContactItem icon="📧" label="Email" value="support@littleshop.com" />
            <ContactItem icon="📞" label="Phone" value="+1 (555) 123-4567" />
            <ContactItem icon="📍" label="Address" value="123 Market Street, San Francisco, CA 94103" />
            <ContactItem icon="🕐" label="Business Hours" value="Mon-Fri 9AM-6PM PST" />
          </div>

          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-card)",
            padding: 24
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Response</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
              We typically respond within 24 hours. For urgent order issues, please include your order number in the message.
            </p>
            <div style={{
              padding: 12,
              background: "var(--bg-soft)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--text-muted)"
            }}>
              <strong>Live chat:</strong> Coming soon
            </div>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-card)",
          padding: 32
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Send Us a Message</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)" }}>
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)" }}>
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)" }}>
                Subject
              </label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select a topic</option>
                <option value="order">Order Inquiry</option>
                <option value="product">Product Question</option>
                <option value="shipping">Shipping & Delivery</option>
                <option value="returns">Returns & Refunds</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)" }}>
                Message *
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
                rows={6}
                required
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: "100%",
                padding: 14,
                fontSize: 16,
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {/* Map placeholder */}
      <div style={{
        marginTop: 40,
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-card)",
        padding: 60,
        textAlign: "center",
        color: "var(--text-muted)"
      }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🗺️</p>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Visit Our Store</p>
        <p style={{ fontSize: 14 }}>123 Market Street, San Francisco, CA 94103</p>
        <p style={{ fontSize: 12, marginTop: 12, opacity: 0.7 }}>Map integration coming soon</p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid var(--border-light)",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "var(--bg-card)",
  color: "var(--text-main)"
};

function ContactItem({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: "var(--bg-soft)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 14, color: "var(--text-main)" }}>{value}</p>
      </div>
    </div>
  );
}
