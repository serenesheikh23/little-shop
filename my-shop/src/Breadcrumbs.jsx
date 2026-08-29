// src/Breadcrumbs.jsx — Navigation breadcrumb trail
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 13, color: "#64748b", marginBottom: 20,
      flexWrap: "wrap"
    }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {item.to && !isLast ? (
              <Link
                to={item.to}
                style={{
                  color: "#3b82f6", textDecoration: "none",
                  fontWeight: 500,
                  textTransform: item.capitalize ? "capitalize" : "none"
                }}
                onMouseEnter={e => e.target.style.textDecoration = "underline"}
                onMouseLeave={e => e.target.style.textDecoration = "none"}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{
                color: isLast ? "#1e293b" : "#64748b",
                fontWeight: isLast ? 600 : 500,
                textTransform: item.capitalize ? "capitalize" : "none"
              }}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span style={{ color: "#cbd5e1" }}>›</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
