// src/api.js — API client with JWT support
const API_URL = "http://localhost:3000/api";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('shop_token', token);
  } else {
    localStorage.removeItem('shop_token');
  }
}

export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem('shop_token');
  }
  return authToken;
}

async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch { /* ignore JSON parsing errors */ }
    throw new Error(errorMsg);
  }
  return res.json();
}

// Auth
export async function loginUser(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}
export async function registerUser(username, email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
}
export async function fetchProfile() { return apiFetch('/auth/me'); }
export async function updateProfile(email) {
  return apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ email })
  });
}

// Products
export async function fetchProducts(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/products${q ? '?' + q : ''}`);
}
export async function fetchProduct(id) { return apiFetch(`/products/${id}`); }
export async function fetchRelatedProducts(id, limit = 4) {
  return apiFetch(`/products/${id}/related?limit=${limit}`);
}
export async function createProduct(formData) { return apiFetch('/products', { method: 'POST', body: formData }); }
export async function updateProduct(id, formData) { return apiFetch(`/products/${id}`, { method: 'PUT', body: formData }); }
export async function deleteProduct(id) { return apiFetch(`/products/${id}`, { method: 'DELETE' }); }

// Categories
export async function fetchCategories() { return apiFetch('/categories'); }

// Search suggestions
export async function fetchSearchSuggestions(q) {
  return apiFetch(`/search/suggestions?q=${encodeURIComponent(q)}`);
}
export async function createCategory(name) { return apiFetch('/categories', { method: 'POST', body: JSON.stringify({ name }) }); }
export async function updateCategory(id, name) { return apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }); }
export async function deleteCategory(id) { return apiFetch(`/categories/${id}`, { method: 'DELETE' }); }

// Cart
export async function fetchCart() { return apiFetch('/cart'); }
export async function addToCart(product_id, quantity = 1) {
  return apiFetch('/cart', { method: 'POST', body: JSON.stringify({ product_id, quantity }) });
}
export async function updateCartItem(id, quantity) {
  return apiFetch(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
}
export async function removeCartItem(id) { return apiFetch(`/cart/${id}`, { method: 'DELETE' }); }
export async function clearCart() { return apiFetch('/cart', { method: 'DELETE' }); }

// Orders
export async function submitOrder(customer_name, customer_email, customer_address) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ customer_name, customer_email, customer_address })
  });
}
export async function fetchOrders() { return apiFetch('/orders'); }
export async function fetchOrder(id) { return apiFetch(`/orders/${id}`); }

// Admin
export async function fetchAdminOrders() { return apiFetch('/admin/orders'); }
export async function updateOrderStatus(id, status) {
  return apiFetch(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}
export async function fetchAdminStats() { return apiFetch('/admin/stats'); }

// Wishlist
export async function fetchWishlist() { return apiFetch('/wishlist'); }
export async function addToWishlist(productId) {
  return apiFetch(`/wishlist/${productId}`, { method: 'POST' });
}
export async function removeFromWishlist(productId) {
  return apiFetch(`/wishlist/${productId}`, { method: 'DELETE' });
}

// Stock notifications
export async function subscribeStockNotification(productId, email) {
  return apiFetch(`/products/${productId}/notify-me`, {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

// Reviews
export async function fetchReviews(productId) {
  return apiFetch(`/products/${productId}/reviews`);
}
export async function submitReview(productId, rating, comment) {
  return apiFetch(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment })
  });
}