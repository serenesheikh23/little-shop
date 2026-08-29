// src/cartReducer.js — Local cart state with support for server-sync SET action
export const initialCartState = (() => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
})();

export function cartReducer(state, action) {
  switch (action.type) {
    case "SET":
      return action.items;
    case "ADD": {
      const existing = state.find((item) => item.product.id === action.product.id);
      if (existing) {
        return state.map((item) =>
          item.product.id === action.product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...state, { product: action.product, qty: 1 }];
    }
    case "CHANGE_QTY": {
      return state
        .map((item) =>
          item.product.id === action.productId ? { ...item, qty: item.qty + action.delta } : item
        )
        .filter((item) => item.qty > 0);
    }
    case "CLEAR":
      return [];
    default:
      return state;
  }
}