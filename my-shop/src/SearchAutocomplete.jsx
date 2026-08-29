// src/SearchAutocomplete.jsx — Search input with instant suggestions
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSearchSuggestions } from "./api";

export default function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSearchSuggestions(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      navigate(`/product/${suggestions[activeIndex].id}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelect = (product) => {
    navigate(`/product/${product.id}`);
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", flex: 1 }}>
      <form onSubmit={handleSubmit}>
        <input
          className="search-input"
          style={{ width: "100%" }}
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </form>

      {showDropdown && query.length >= 2 && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 100,
          maxHeight: 320,
          overflowY: "auto"
        }}>
          {suggestions.map((product, idx) => (
            <div
              key={product.id}
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setActiveIndex(idx)}
              style={{
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                background: activeIndex === idx ? "#f1f5f9" : "transparent",
                borderBottom: idx < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                transition: "background 0.1s"
              }}
            >
              <span style={{ fontSize: 24 }}>{product.emoji || "🛍️"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 500, fontSize: 14,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>
                  {highlightMatch(product.name, query)}
                </div>
                {product.category && (
                  <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "capitalize" }}>
                    {product.category}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6", whiteSpace: "nowrap" }}>
                ${parseFloat(product.price).toFixed(2)}
              </div>
            </div>
          ))}
          <div
            onClick={handleSubmit}
            style={{
              padding: "8px 14px",
              background: "#f8fafc",
              fontSize: 13,
              color: "#3b82f6",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 500,
              borderTop: "1px solid #e2e8f0"
            }}
          >
            See all results for "{query}" →
          </div>
        </div>
      )}

      {showDropdown && query.length >= 2 && suggestions.length === 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "16px",
          zIndex: 100,
          textAlign: "center",
          color: "#64748b",
          fontSize: 14,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          No products found for "{query}"
        </div>
      )}
    </div>
  );
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.substring(0, idx)}
      <mark style={{ background: "transparent", color: "#3b82f6", fontWeight: 700 }}>
        {text.substring(idx, idx + query.length)}
      </mark>
      {text.substring(idx + query.length)}
    </>
  );
}
