import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  isHydrated: false, // Track if loadUser has finished at least once

  get isAuthenticated() {
    return !!get().token && !!get().user;
  },

  get isAdmin() {
    return get().user?.role === 'admin';
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null, isHydrated: true, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, token, error: null, isHydrated: true });
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Auth verification failed:', error);
      get().clearAuth();
      set({ isHydrated: true });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, ...userData } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false, error: null, isHydrated: true });
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid credentials';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      const { token, ...userData } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false, error: null, isHydrated: true });
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateProfile: async (updates) => {
    set({ loading: true });
    try {
      const { data } = await api.put('/auth/profile', updates);
      // Backend returns { ..., token }
      const { token, ...userData } = data;
      
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      set(state => ({ 
        user: userData, 
        token: token || state.token, 
        loading: false 
      }));
      return userData;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const { data } = await api.put(`/auth/wishlist/${productId}`);
      // data is the updated wishlist array
      const updatedUser = { ...get().user, wishlist: data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    get().clearAuth();
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null, loading: false, isHydrated: true });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
