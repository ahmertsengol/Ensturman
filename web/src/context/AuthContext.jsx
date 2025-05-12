// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile } from '../api/api';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend bağlantı durumunu kontrol et
  const checkServerConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (err) {
      console.error('Server connection check failed:', err);
      return false;
    }
  };

  // Load user from token on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Önce backend'in çalışıp çalışmadığını kontrol et
      const isServerUp = await checkServerConnection();
      if (!isServerUp) {
        setError('Backend server is not accessible. Please check if it is running.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await getUserProfile();
        setCurrentUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user', err);
        
        // Token geçersiz veya kullanım süresi dolmuşsa
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
        } 
        // API server çalışıyor ancak CORS hatası veya başka bir network hatası var
        else if (err.message === 'Network Error') {
          setError('Cannot connect to server due to CORS or network issue. Please contact support.');
        }
        // API server çalışmıyor veya erişilemiyorsa
        else if (err.request) {
          setError('Cannot connect to server. Please check if the backend is running.');
        } 
        // Diğer hatalar
        else {
          setError('An unexpected error occurred. Please try again.');
        }
        
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setCurrentUser(userData);
    setError(null);
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser && !!localStorage.getItem('token');
  };

  const contextValue = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 