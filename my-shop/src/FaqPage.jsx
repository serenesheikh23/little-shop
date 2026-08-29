// src/FaqPage.jsx — FAQ page with accordion
import { useState } from "react";
import Breadcrumbs from "./Breadcrumbs";

const faqCategories = [
  {
    title: "Orders",
    icon: "📦",
    questions: [
      { q: "How do I place an order?", a: "Browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or checkout as a guest. We accept all major credit cards and PayPal." },
      { q: "Can I modify my order after placing it?", a: "Once an order is placed, it enters our fulfillment process immediately. Contact us within 1 hour if you need to make changes. We'll do our best to accommodate your request." },
      { q: "Do I need an account to order?", a: "No, you can checkout as a guest. However, creating an account lets you track orders, save your shipping info, and enjoy faster checkout next time." },
    ]
  },
  {
    title: "Shipping",
    icon: "🚚",
    questions: [
      { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for $9.99. Overnight shipping is available for $19.99." },
      { q: "Do you ship internationally?", a: "Currently, we ship within the United States only. We're working on expanding our international shipping options." },
      { q: "How can I track my order?", a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order in your account dashboard." },
      { q: "Is shipping free?", a: "We offer free standard shipping on orders over $50. Orders under $50 have a flat $5.99 shipping fee." },
    ]
  },
  {
    title: "Returns",
    icon: "↩️",
    questions: [
      { q: "What is your return policy?", a: "We offer a 30-day return policy for unused items in original packaging. Items must be in the same condition as when you received them." },
      { q: "How do I return an item?", a: "Log into your account, go to Order History, and click 'Return Item' next to the product. Follow the instructions to print a prepaid return label." },
      { q: "How long do refunds take?", a: "Refunds are processed within 3-5 business days after we receive your return. The refund will be credited to your original payment method." },
    ]
  },
  {
    title: "Products",
    icon: "🛍️",
    questions: [
      { q: "Are your products authentic?", a: "Yes! We source directly from manufacturers and authorized distributors. Every product is guaranteed authentic." },
      { q: "Do you offer warranties?", a: "All products come with manufacturer warranties where applicable. Additional warranty information is listed on individual product pages." },
      { q: "What if an item is out of stock?", a: "You can sign up for 'Email me when in stock' on the product page. We'll notify you via email when it's available again." },
    ]
  },
  {
    title: "Account",
    icon: "👤",
    questions: [
      { q: "How do I create an account?", a: "Click 'Sign In' in the top navigation, then 'Create Account'. Enter your email and a password to get started." },
      { q: "I forgot my password. What do I do?", a: "Click 'Forgot Password' on the login page. Enter your email and we'll send you a link to reset your password." },
      { q: "How do I update my account information?", a: "Log in and go to 'Profile' in the navigation. You can update your email, password, and shipping addresses there." },
    ]
  }
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      borderBottom: "1px solid var(--border-light)"
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-main)"
        }}
      >
        <span style={{ flex: 1, paddingRight: 16 }}>{question}</span>
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          background: open ? "var(--primary-blue)" : "var(--bg-soft)",
          color: open ? "white" : "var(--text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, transition: "all 0.2s", flexShrink: 0
        }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{
          padding: "0 20px 16px",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.7
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Breadcrumbs items={[
        { to: "/", label: "Home" },
        { label: "FAQ" }
      ]} />

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
          Frequently Asked <span style={{ color: "var(--primary-blue)" }}>Questions</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto" }}>
          Find answers to common questions about orders, shipping, returns, and more.
        </p>
      </div>

      {/* Search placeholder */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-card)",
        padding: 24,
        marginBottom: 40,
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: 14
      }}>
        <p>Can't find what you're looking for?</p>
        <p style={{ marginTop: 8 }}>
          Contact our support team at <span style={{ color: "var(--primary-blue)", fontWeight: 600 }}>support@littleshop.com</span>
        </p>
      </div>

      {/* FAQ Categories */}
      {faqCategories.map(category => (
        <div key={category.title} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-card)",
          marginBottom: 24,
          overflow: "hidden"
        }}>
          <div style={{
            padding: "16px 20px",
            background: "var(--bg-soft)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid var(--border-light)"
          }}>
            <span style={{ fontSize: 24 }}>{category.icon}</span>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{category.title}</h2>
          </div>
          {category.questions.map(item => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      ))}
    </div>
  );
}
