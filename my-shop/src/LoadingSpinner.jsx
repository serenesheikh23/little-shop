// src/LoadingSpinner.jsx — Reusable loading indicator
export default function LoadingSpinner({ size = 40, message = "Loading..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 60,
      gap: 16,
      color: "#64748b"
    }}>
      <div
        style={{
          width: size,
          height: size,
          border: `${Math.max(3, size / 12)}px solid #e2e8f0`,
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }}
      />
      {message && <p style={{ fontSize: 14, color: "#64748b" }}>{message}</p>}
    </div>
  );
}
