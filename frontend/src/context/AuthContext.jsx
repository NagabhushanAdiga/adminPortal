import { createContext, useContext, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('adminPortalUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username, password) => {
    try {
      const data = await api.login(username, password);
      if (data.ok && data.user) {
        const userData = { username: data.user.username, role: data.user.role, name: data.user.name };
        setUser(userData);
        localStorage.setItem('adminPortalUser', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid username or password' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminPortalUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
