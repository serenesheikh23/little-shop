// src/ReviewsSection.jsx — Reviews & ratings for a product
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchReviews, submitReview } from "./api";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";

function StarRating({ rating, onRate, size = 28, interactive = false }) {
  const [hover, setHover] = useState(0);
  const active = hover || rating;

  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => interactive && onRate && onRate(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            fontSize: size,
            color: n <= active ? "#f59e0b" : "#e2e8f0",
            cursor: interactive ? "pointer" : "default",
            transition: "color 0.15s, transform 0.1s",
            transform: interactive && hover === n ? "scale(1.15)" : "scale(1)",
            lineHeight: 1
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function StarSummary({ average, count, distribution }) {
  return (
    <div style={{
      background: "#f8fafc", borderRadius: 12, padding: 20,
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#1e293b" }}>
          {average > 0 ? average.toFixed(1) : "—"}
        </div>
        <StarRating rating={Math.round(average)} size={20} />
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          {count} review{count !== 1 ? "s" : ""}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[5, 4, 3, 2, 1].map(star => {
          const cnt = distribution[star] || 0;
          const pct = count > 0 ? (cnt / count) * 100 : 0;
          return (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ minWidth: 18, color: "#64748b" }}>{star}★</span>
              <div style={{ flex: 1, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: "#f59e0b", transition: "width 0.3s"
                }} />
              </div>
              <span style={{ minWidth: 24, textAlign: "right", color: "#64748b" }}>{cnt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReviewsSection({ productId }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState({ reviews: [], summary: { count: 0, average: 0, distribution: {} } });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = () => {
    fetchReviews(productId)
      .then(data => {
        setData(data || { reviews: [], summary: { count: 0, average: 0, distribution: {} } });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadReviews();
  }, [productId]);

  const userAlreadyReviewed = user && data.reviews.some(r => r.user_id === user.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRating === 0) {
      addToast("Please select a rating", "error");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(productId, newRating, newComment);
      addToast("Review submitted!", "success");
      setNewRating(0);
      setNewComment("");
      setShowForm(false);
      loadReviews();
    } catch (err) {
      addToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Customer Reviews</h2>

      {loading ? (
        <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>Loading reviews...</p>
      ) : (
        <>
          <StarSummary
            average={data.summary.average}
            count={data.summary.count}
            distribution={data.summary.distribution}
          />

          {/* Review form */}
          <div style={{ marginTop: 24 }}>
            {!user ? (
              <div style={{
                padding: 16, background: "#f1f5f9", borderRadius: 12,
                textAlign: "center", color: "#64748b", fontSize: 14
              }}>
                <Link to="/login" style={{ color: "#3b82f6", fontWeight: 600 }}>Sign in</Link> to leave a review
              </div>
            ) : userAlreadyReviewed ? (
              <div style={{
                padding: 16, background: "#f0fdf4", borderRadius: 12,
                textAlign: "center", color: "#166534", fontSize: 14
              }}>
                ✓ You've already reviewed this product
              </div>
            ) : showForm ? (
              <form onSubmit={handleSubmit} style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20
              }}>
                <h4 style={{ marginBottom: 12 }}>Write a Review</h4>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#64748b" }}>
                    Your Rating
                  </label>
                  <StarRating rating={newRating} onRate={setNewRating} size={32} interactive />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#64748b" }}>
                    Your Review (optional)
                  </label>
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    rows={3}
                    placeholder="Share your thoughts about this product..."
                    style={{
                      width: "100%", padding: 10, border: "1px solid #e2e8f0",
                      borderRadius: 8, fontSize: 14, fontFamily: "inherit", resize: "vertical"
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "10px 20px", background: "#3b82f6", color: "white",
                      border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                      opacity: submitting ? 0.6 : 1
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setNewRating(0); setNewComment(""); }}
                    style={{
                      padding: "10px 20px", background: "#f1f5f9", color: "#64748b",
                      border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 500, cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: "10px 20px", background: "#3b82f6", color: "white",
                  border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer"
                }}
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Reviews list */}
          {data.reviews.length > 0 && (
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {data.reviews.map(review => (
                <div key={review.id} style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 12, padding: 16
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{review.username}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <StarRating rating={review.rating} size={16} />
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#475569", marginTop: 8 }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.reviews.length === 0 && !loading && (
            <p style={{ textAlign: "center", color: "#64748b", padding: 24, marginTop: 24 }}>
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </>
      )}
    </div>
  );
}
