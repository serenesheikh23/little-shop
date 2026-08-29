// src/TrustBadges.jsx — Trust indicators section
const badges = [
  { icon: "🔒", label: "Secure Checkout", desc: "SSL encrypted" },
  { icon: "✅", label: "30-Day Money Back", desc: "Easy returns" },
  { icon: "🚚", label: "Free Shipping", desc: "On orders over $50" },
  { icon: "💳", label: "Secure Payments", desc: "All major cards" }
];

export default function TrustBadges({ compact = false }) {
  if (compact) {
    // Inline badges for checkout page
    return (
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap",
        justifyContent: "center",
        padding: 12,
        background: "var(--bg-soft)",
        borderRadius: 8,
        fontSize: 12,
        color: "var(--text-muted)"
      }}>
        {badges.map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>{b.icon}</span>
            <span style={{ fontWeight: 500 }}>{b.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
      margin: "32px 0"
    }}>
      {badges.map(b => (
        <div key={b.label} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-card)",
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "var(--bg-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0
          }}>
            {b.icon}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>{b.label}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
