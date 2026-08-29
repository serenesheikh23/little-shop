// src/TermsPage.jsx — Terms & Conditions page
import Breadcrumbs from "./Breadcrumbs";

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing and using the Little Shop website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.

These Terms and Conditions apply to all users of the website. We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.`
  },
  {
    title: "Products and Pricing",
    content: `All products listed on our website are subject to availability. We strive to display accurate product information, including pricing, but errors may occur.

• Prices are listed in US Dollars (USD)
• Prices are subject to change without notice
• We reserve the right to limit quantities
• Product images are for illustration purposes
• We reserve the right to discontinue any product at any time`
  },
  {
    title: "Account Registration",
    content: `To place orders, you may create an account or checkout as a guest. When creating an account, you agree to:
• Provide accurate and complete information
• Maintain the security of your password
• Notify us of any unauthorized access
• Be responsible for all activities under your account

We reserve the right to terminate accounts that violate these terms.`
  },
  {
    title: "Orders and Payment",
    content: `By placing an order, you make an offer to purchase the products selected. We reserve the right to accept or decline any order.

• Payment is processed at time of order
• We accept Visa, Mastercard, American Express, PayPal, and Apple Pay
• We reserve the right to cancel orders suspected of fraud
• Order confirmation does not guarantee product availability
• All prices include applicable taxes`
  },
  {
    title: "Shipping and Delivery",
    content: `Shipping rates and delivery times vary by location and shipping method selected.

• Standard shipping: 5-7 business days ($5.99 or FREE over $50)
• Express shipping: 2-3 business days ($9.99)
• Overnight shipping: Next business day ($19.99)

Risk of loss passes to you upon delivery to the carrier. We are not responsible for delays caused by carriers or customs.`
  },
  {
    title: "Returns and Refunds",
    content: `We want you to be satisfied with your purchase. Our return policy:

• 30-day return window from delivery date
• Items must be unused and in original packaging
• Prepaid return labels provided for eligible returns
• Refunds processed within 3-5 business days
• Return shipping costs are the customer's responsibility unless the return is due to our error

Exclusions: Personalized items, perishable goods, and items marked "final sale" cannot be returned.`
  },
  {
    title: "Intellectual Property",
    content: `All content on this website, including text, graphics, logos, images, and software, is the property of Little Shop or its content suppliers and is protected by copyright laws.

You may not:
• Copy, reproduce, or distribute website content without permission
• Use our trademarks without written consent
• Reverse engineer or decompile any website functionality
• Interfere with the website's proper operation`
  },
  {
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by law, Little Shop shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:

• Your use of or inability to use the website
• Any products purchased through the website
• Any unauthorized access to your account
• Any errors or omissions in content
• Any conduct of third parties on the website

Our total liability shall not exceed the amount you paid for the products giving rise to the claim.`
  },
  {
    title: "Indemnification",
    content: `You agree to indemnify, defend, and hold harmless Little Shop and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:

• Your use of the website
• Your violation of these Terms
• Your violation of any third-party rights
• Any fraudulent activity`
  },
  {
    title: "Governing Law",
    content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.

Any disputes arising from these terms shall be resolved in the courts of San Francisco County, California, and you hereby consent to the personal jurisdiction of such courts.`
  },
  {
    title: "Contact Information",
    content: `For questions about these Terms and Conditions, please contact us:

Email: legal@littleshop.com
Address: 123 Market Street, San Francisco, CA 94103

We will respond to your inquiry within 30 days.`
  }
];

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Breadcrumbs items={[
        { to: "/", label: "Home" },
        { label: "Terms & Conditions" }
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
          Terms & <span style={{ color: "var(--primary-blue)" }}>Conditions</span>
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
          Please read these Terms and Conditions carefully before using the Little Shop website. By using our website, you agree to be bound by these terms.
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
