import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  get isAuthenticated() {
    return !!get().token;
  },

  get isAdmin() {
    return get().user?.role === 'admin';
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, token: data.token, loading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      set({ loading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, token });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },

  updateProfile: async (updates) => {
    set({ loading: true });
    try {
      const { data } = await api.put('/auth/profile', updates);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const { data } = await api.put(`/auth/wishlist/${productId}`);
      set(state => ({
        user: { ...state.user, wishlist: data }
      }));
      return data;
    } catch (error) {
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
