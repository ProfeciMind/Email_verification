
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({ isAuthenticated: false, loading: false });
        return;
      }
      
      try {
        // Set Auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token by getting user data
        const res = await axios.get('/api/auth/user');
        
        if (res.data) {
          setAuthState({ isAuthenticated: true, loading: false });
        } else {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setAuthState({ isAuthenticated: false, loading: false });
        }
      } catch (err) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setAuthState({ isAuthenticated: false, loading: false });
      }
    };
    
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
