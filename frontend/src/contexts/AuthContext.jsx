/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const u = data.data;
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('token', u.token);
      return u;
    } catch (error) { console.error(error);
      throw new Error(error.response?.data?.message || 'Login failed', { cause: error });
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      return data;
    } catch (error) { console.error(error);
      // Return specific validation errors if present
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        const msg = Object.values(errors[0])[0];
        throw new Error(msg, { cause: error });
      }
      throw new Error(error.response?.data?.message || 'Registration failed', { cause: error });
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
