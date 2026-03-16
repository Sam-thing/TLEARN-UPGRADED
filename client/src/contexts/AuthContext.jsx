// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // FIX: Restore user from token on page load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token and get user data
          const response = await axios.get('https://tlearn-api.onrender.com/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUser(response.data.user);
          console.log('✅ User session restored:', response.data.user.name);
        } catch (error) {
          console.error('❌ Token expired or invalid');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://tlearn-api.onrender.com/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('https://tlearn-api.onrender.com/api/auth/register', {
        name,
        email,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};