import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleAuth: (data) => api.post('/auth/google', data),
  guestLogin: () => api.post('/auth/guest'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Products API ────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  searchSuggestions: (q) => api.get('/products/search', { params: { q } }),
  getBrands: (params) => api.get('/products/brands', { params }),
  getColors: (params) => api.get('/products/colors', { params }),
};

// ─── Categories API ──────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getProducts: (id, params) => api.get(`/categories/${id}/products`, { params }),
  getSubcategories: (id) => api.get(`/categories/${id}/subcategories`),
  getSubSubcategories: (id) => api.get(`/categories/subcategories/${id}/subsubcategories`),
  getAllBrands: () => api.get('/categories/brands/all'),
  getAllColors: () => api.get('/categories/colors/all'),
};

// ─── Cart API ────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  getCount: () => api.get('/cart/count'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/update/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

// ─── Orders API ──────────────────────────────────────
export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  placeDirect: (data) => api.post('/orders/direct', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
};

// ─── Wishlist API ────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (product_id) => api.post('/wishlist/add', { product_id }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
  check: (productId) => api.get(`/wishlist/check/${productId}`),
};

// ─── Address API ─────────────────────────────────────
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  add: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  remove: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};

export default api;
