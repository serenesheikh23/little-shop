// src/CheckoutPage.jsx — Multi-step checkout: shipping → review → confirmation
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "./hooks/useCart";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";
import { submitOrder } from "./api";
import LoadingSpinner from "./LoadingSpinner";
import TrustBadges from "./TrustBadges";

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard Shipping", desc: "5-7 business days", cost: 0 },
  { id: "express", label: "Express Shipping", desc: "2-3 business days", cost: 9.99 },
  { id: "overnight", label: "Overnight Shipping", desc: "Next business day", cost: 19.99 }
];

const STEPS = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Review & Pay" },
  { id: 3, label: "Confirmation" }
];

function ProgressSteps({ currentStep }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      marginBottom: 32, gap: 0
    }}>
      {STEPS.map((step, i) => {
        const isActive = currentStep === step.id;
        const isComplete = currentStep > step.id;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: isComplete ? "#22c55e" : isActive ? "#3b82f6" : "#e2e8f0",
                color: isComplete || isActive ? "white" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14,
                transition: "all 0.3s"
              }}>
                {isComplete ? "✓" : step.id}
              </div>
              <span style={{
                marginTop: 6, fontSize: 12, fontWeight: 500,
                color: isActive ? "#3b82f6" : isComplete ? "#22c55e" : "#94a3b8"
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 80, height: 2, margin: "0 8px", marginBottom: 22,
                background: isComplete ? "#22c55e" : "#e2e8f0",
                transition: "background 0.3s"
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: user?.username || "",
    customer_email: user?.email || "",
    customer_address: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("standard");

  const validateShipping = () => {
    const errs = {};
    if (!form.customer_name.trim()) errs.customer_name = "Name is required";
    if (!form.customer_email.trim()) errs.customer_email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.customer_email)) errs.customer_email = "Invalid email format";
    if (!form.customer_address.trim()) errs.customer_address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToReview = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const result = await submitOrder(form.customer_name, form.customer_email, form.customer_address);
      setOrderResult(result);
      clearCart();
      setStep(3);
      addToast("Order placed successfully!", "success");
      window.scrollTo(0, 0);
    } catch (err) {
      addToast(err.message || "Checkout failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:3000${url}`;
  };

  if (cartItems.length === 0 && !orderResult) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
        <p style={{ fontSize: 20, color: "#64748b", marginBottom: 24 }}>Your cart is empty</p>
        <Link to="/products" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
          Browse Products
        </Link>
      </div>
    );
  }

  const shippingCost = SHIPPING_METHODS.find(m => m.id === shippingMethod).cost;
  const tax = total * 0.08; // 8% tax
  const grandTotal = total + shippingCost + tax;

  // Order success screen
  if (orderResult && step === 3) {
    return (
      <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
        <ProgressSteps currentStep={3} />
        <div style={{
          background: "#fff", borderRadius: 16, padding: 40,
          border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#dcfce7", color: "#22c55e",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 40
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Order Confirmed!</h2>
          <p style={{ color: "#64748b", marginBottom: 8 }}>
            Thank you, {form.customer_name}!
          </p>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
            Order <strong>#{orderResult.id}</strong> has been placed.
            A confirmation email will be sent to {form.customer_email}.
          </p>
          <div style={{
            background: "#f8fafc", borderRadius: 12, padding: 20,
            textAlign: "left", marginBottom: 24
          }}>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>Order Summary</p>
            {orderResult.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0" }}>
                <span>{item.product_name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #e2e8f0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, color: "#3b82f6" }}>
              <span>Total Paid</span>
              <span>${orderResult.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/profile")}
              style={{
                padding: "10px 24px", background: "#f1f5f9",
                border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600
              }}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <ProgressSteps currentStep={step} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "flex-start" }}>
        {/* Main content area */}
        <div>
          {step === 1 && (
            <form onSubmit={handleContinueToReview} style={{
              background: "#fff", borderRadius: 16, padding: 32,
              border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>Shipping Information</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                Where should we send your order?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#64748b" }}>
                    Full Name *
                  </label>
                  <input
                    value={form.customer_name}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="John Doe"
                    style={{
                      width: "100%", padding: 12, border: `1px solid ${errors.customer_name ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 8, outline: "none", fontSize: 14
                    }}
                  />
                  {errors.customer_name && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.customer_name}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#64748b" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={form.customer_email}
                    onChange={e => setForm({ ...form, customer_email: e.target.value })}
                    placeholder="john@example.com"
                    style={{
                      width: "100%", padding: 12, border: `1px solid ${errors.customer_email ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 8, outline: "none", fontSize: 14
                    }}
                  />
                  {errors.customer_email && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.customer_email}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#64748b" }}>
                    Shipping Address *
                  </label>
                  <textarea
                    value={form.customer_address}
                    onChange={e => setForm({ ...form, customer_address: e.target.value })}
                    placeholder="123 Main St, Apt 4B&#10;City, State, ZIP"
                    rows={3}
                    style={{
                      width: "100%", padding: 12, border: `1px solid ${errors.customer_address ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 8, outline: "none", fontSize: 14, resize: "vertical", fontFamily: "inherit"
                    }}
                  />
                  {errors.customer_address && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.customer_address}</p>}
                </div>

                {/* Shipping method selector */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>
                    Shipping Method
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {SHIPPING_METHODS.map(method => (
                      <label key={method.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: 12, border: `2px solid ${shippingMethod === method.id ? "#3b82f6" : "#e2e8f0"}`,
                        borderRadius: 8, cursor: "pointer",
                        background: shippingMethod === method.id ? "#eff6ff" : "white",
                        transition: "all 0.2s"
                      }}>
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={e => setShippingMethod(e.target.value)}
                          style={{ cursor: "pointer" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{method.label}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{method.desc}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: method.cost === 0 ? "#22c55e" : "#1e293b" }}>
                          {method.cost === 0 ? "FREE" : `$${method.cost.toFixed(2)}`}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  style={{
                    padding: "12px 20px", background: "#f1f5f9",
                    border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600
                  }}
                >
                  ← Back to Cart
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: 14, fontSize: 16 }}
                >
                  Continue to Review →
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: 32,
              border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>Review Your Order</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                Please review before placing your order
              </p>

              {/* Items */}
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Items ({itemCount})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {cartItems.map(item => {
                  const imgUrl = getImageUrl(item.product.image);
                  return (
                    <div key={item.product.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: 12, background: "#f8fafc", borderRadius: 8
                    }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product.name}
                          style={{ width: 50, height: 50, borderRadius: 6, objectFit: "cover" }} />
                      ) : (
                        <div style={{
                          width: 50, height: 50, borderRadius: 6, background: "#e2e8f0",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24
                        }}>
                          {item.product.emoji || "🛍️"}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.product.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          ${parseFloat(item.product.price).toFixed(2)} × {item.qty}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: "#3b82f6" }}>
                        ${(item.product.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shipping info summary */}
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ship To</h3>
              <div style={{
                padding: 12, background: "#f8fafc", borderRadius: 8,
                fontSize: 14, marginBottom: 24, lineHeight: 1.6
              }}>
                <div><strong>{form.customer_name}</strong></div>
                <div style={{ color: "#64748b" }}>{form.customer_email}</div>
                <div style={{ color: "#64748b", whiteSpace: "pre-line" }}>{form.customer_address}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#3b82f6" }}>
                  📦 {SHIPPING_METHODS.find(m => m.id === shippingMethod).label}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  style={{
                    padding: "12px 20px", background: "#f1f5f9",
                    border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600
                  }}
                >
                  ← Edit Shipping
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 1, padding: 14, fontSize: 16, opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "white", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite", display: "inline-block"
                      }} />
                      Processing...
                    </span>
                  ) : `Place Order — $${grandTotal.toFixed(2)}`}
                </button>
              </div>

              <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 16, margin: 0 }}>
                🔒 Secure checkout — no real payment will be processed
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar (always visible) */}
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 24,
            border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>

            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
              {cartItems.map(item => (
                <div key={item.product.id} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 13, padding: "6px 0", color: "#475569"
                }}>
                  <span style={{ flex: 1, paddingRight: 8 }}>
                    {item.product.name} <span style={{ color: "#94a3b8" }}>× {item.qty}</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ${(item.product.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Shipping</span>
                <span style={{ color: shippingCost === 0 ? "#22c55e" : "inherit" }}>
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "#64748b" }}>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 18, fontWeight: 700, color: "#3b82f6",
                paddingTop: 12, borderTop: "1px solid #e2e8f0"
              }}>
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 12, padding: 12, background: "#f0fdf4",
            borderRadius: 8, fontSize: 12, color: "#166534",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <span>🔒</span>
            <span>Your payment info is encrypted and secure</span>
          </div>

          <div style={{ marginTop: 16 }}>
            <TrustBadges compact />
          </div>
        </div>
      </div>
    </div>
  );
}
