// src/PrivacyPage.jsx — Privacy Policy page
import Breadcrumbs from "./Breadcrumbs";

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly to us, including:
• Account information (name, email address, password)
• Contact information (shipping address, phone number)
• Payment information (credit card details - processed securely through our payment provider)
• Order history and preferences
• Communications and correspondence

We also automatically collect certain information when you visit our site, including your IP address, browser type, pages visited, and device information.`
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to:
• Process and fulfill your orders
• Send order confirmations and shipping updates
• Respond to your questions and provide customer support
• Send promotional communications (with your consent)
• Improve our website and services
• Detect and prevent fraud
• Comply with legal obligations`
  },
  {
    title: "Cookies and Tracking",
    content: `We use cookies and similar tracking technologies to:
• Remember your preferences and cart items
• Understand how you use our website
• Deliver personalized content and advertisements
• Analyze site traffic and usage

You can control cookies through your browser settings. Disabling cookies may affect some site functionality.`
  },
  {
    title: "Third-Party Services",
    content: `We may share your information with third parties who perform services on our behalf, including:
• Payment processors (Stripe, PayPal)
• Shipping carriers (USPS, FedEx, UPS)
• Analytics providers (Google Analytics)
• Email marketing platforms

These service providers are authorized to use your personal information only as necessary to provide these services to us.`
  },
  {
    title: "Data Security",
    content: `We implement appropriate technical and organizational measures to protect your personal information, including:
• SSL encryption for all data transmission
• Secure storage of payment information
• Regular security assessments
• Access controls and employee training

However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`
  },
  {
    title: "Your Rights",
    content: `You have the right to:
• Access your personal information
• Correct inaccurate information
• Delete your personal information
• Opt out of marketing communications
• Export your data in a portable format
• Object to certain processing activities

To exercise these rights, please contact us at privacy@littleshop.com.`
  },
  {
    title: "Children's Privacy",
    content: `Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.`
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.`
  },
  {
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us:
Email: privacy@littleshop.com
Address: 123 Market Street, San Francisco, CA 94103`
  }
];

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Breadcrumbs items={[
        { to: "/", label: "Home" },
        { label: "Privacy Policy" }
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
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
          Privacy <span style={{ color: "var(--primary-blue)" }}>Policy</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Last Updated: August 29, 2026
        </p>
      </div>

      {/* Intro */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-card)",
        padding: 24,
        marginBottom: 32
      }}>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)" }}>
          At Little Shop, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal information when you use our website and services.
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, idx) => (
        <div key={idx} style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-card)",
          padding: 28,
          marginBottom: 20
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--text-main)" }}>
            {section.title}
          </h2>
          <div style={{ fontSize: 14, lineHeight: 1.9, color: "var(--text-muted)", whiteSpace: "pre-line" }}>
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
}
