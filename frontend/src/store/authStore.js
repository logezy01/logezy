import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('logezy_user')) || null,
  token: localStorage.getItem('logezy_token') || null,
  isAuthenticated: !!localStorage.getItem('logezy_token'),

  login: (user, token) => {
    localStorage.setItem('logezy_token', token);
    localStorage.setItem('logezy_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('logezy_token');
    localStorage.removeItem('logezy_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updated = { ...JSON.parse(localStorage.getItem('logezy_user')), ...userData };
    localStorage.setItem('logezy_user', JSON.stringify(updated));
    set({ user: updated });
  },
}));

export default useAuthStore;