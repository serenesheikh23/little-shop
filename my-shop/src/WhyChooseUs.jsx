// src/WhyChooseUs.jsx — Benefits section
const benefits = [
  {
    icon: "🌟",
    title: "Premium Quality",
    desc: "Every product is hand-selected and tested for quality, durability, and value. We never sell anything we wouldn't use ourselves."
  },
  {
    icon: "🚀",
    title: "Fast Shipping",
    desc: "Free shipping on orders over $50, with most orders arriving in 2-3 days. Express options available at checkout."
  },
  {
    icon: "💬",
    title: "24/7 Support",
    desc: "Our friendly customer service team is always here to help. Reach us anytime via email, phone, or live chat."
  },
  {
    icon: "🔒",
    title: "Secure Shopping",
    desc: "Shop with confidence knowing your data is protected by enterprise-grade encryption and security measures."
  }
];

export default function WhyChooseUs() {
  return (
    <div style={{ margin: "48px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Why Choose <span style={{ color: "var(--primary-blue)" }}>Little Shop</span>?
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto" }}>
          We're more than just a store—we're your partner in finding quality products you'll love.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 24
      }}>
        {benefits.map(b => (
          <div key={b.title} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-card)",
            padding: 28,
            textAlign: "center",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-soft)";
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "linear-gradient(135deg, var(--primary-blue) 0%, #8b5cf6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 16px"
            }}>
              {b.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
