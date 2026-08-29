// src/AboutPage.jsx — About Us page
import { Link } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";

const team = [
  { name: "Sarah Chen", role: "Founder & CEO", emoji: "👩‍💼", bio: "Visionary leader with 15 years in e-commerce." },
  { name: "Marcus Johnson", role: "Head of Operations", emoji: "👨‍💼", bio: "Ensures every order ships on time." },
  { name: "Emily Rodriguez", role: "Head of Design", emoji: "👩‍🎨", bio: "Creates beautiful experiences you'll love." },
  { name: "David Kim", role: "Head of Technology", emoji: "👨‍💻", bio: "Builds the tech that powers Little Shop." },
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Breadcrumbs items={[
        { to: "/", label: "Home" },
        { label: "About Us" }
      ]} />

      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--border-light)",
        marginBottom: 40
      }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
          About <span style={{ color: "var(--primary-blue)" }}>Little Shop</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
          We're on a mission to bring quality products to your doorstep at prices that make sense. Founded in 2020, Little Shop started as a small family business and has grown into a trusted destination for everyday essentials.
        </p>
      </div>

      {/* Story */}
      <div style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--border-light)",
        padding: 40,
        marginBottom: 40
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Our Story</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 16 }}>
          Little Shop began in a small apartment in San Francisco when our founder, Sarah, couldn't find quality everyday products at fair prices. What started as a weekend project curating the best home goods quickly evolved into something bigger.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 16 }}>
          Today, we partner with hundreds of artisans and manufacturers to bring you carefully selected products—from kitchen essentials to office must-haves—each one chosen for quality, value, and sustainability.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)" }}>
          Every item in our store has passed our rigorous quality standards. We believe you shouldn't have to choose between great products and great prices.
        </p>
      </div>

      {/* Mission */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-blue) 0%, #8b5cf6 100%)",
        borderRadius: "var(--radius-card)",
        padding: 48,
        color: "white",
        textAlign: "center",
        marginBottom: 40
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Our Mission</h2>
        <p style={{ fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.7, opacity: 0.95 }}>
          "To make quality products accessible to everyone through fair pricing, exceptional service, and a shopping experience that feels personal—not like a corporate transaction."
        </p>
      </div>

      {/* Team */}
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Meet Our Team</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 24
      }}>
        {team.map(member => (
          <div key={member.name} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-card)",
            padding: 28,
            textAlign: "center",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "var(--bg-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, margin: "0 auto 16px"
            }}>
              {member.emoji}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{member.name}</h3>
            <p style={{ fontSize: 13, color: "var(--primary-blue)", fontWeight: 600, marginBottom: 8 }}>
              {member.role}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              {member.bio}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        marginTop: 48,
        textAlign: "center",
        padding: 40,
        background: "var(--bg-card)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--border-light)"
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Ready to Start Shopping?</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          Browse our curated collection of quality products.
        </p>
        <Link to="/products" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
          Shop Now →
        </Link>
      </div>
    </div>
  );
}
