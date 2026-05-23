// src/contexts/AuthContext.jsx
// KEY FIX: loading=false immediately on mount, auth resolves in background.
// This eliminates the "stuck on loading spinner" while Render cold-starts.
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

// Axios instance with auth header injected automatically
const authApi = axios.create({ baseURL: API_URL });
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);   // only true during initial check
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  // ── On mount: try to restore session ─────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token — skip network call entirely, render immediately
        setLoading(false);
        setAuthReady(true);
        return;
      }

      try {
        const res = await authApi.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        // Token expired or server error — clear stale token
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
        }
        // Don't redirect here — let ProtectedRoute handle it
      } finally {
        // Always unblock UI regardless of network result
        setLoading(false);
        setAuthReady(true);
      }
    };

    restore();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  }, [navigate]);

  // ── Register ──────────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    try {
      const res = await authApi.post('/auth/register', { name, email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  }, [navigate]);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── Update user in context (called after profile save) ────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  // ── Only show full-page spinner on the very first load if there's a token ─────
  // After that, children always render — ProtectedRoute handles auth gates.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authReady,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};