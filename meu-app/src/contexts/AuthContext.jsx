import { createContext, useState, useContext } from 'react';
import httpNode from '../services/httpNode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    try {
      const response = await httpNode.post('/login', { user: username, senha: password });
      const { token, user: data } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.msg || 'Erro de autenticação' 
      };
    }
  };

  const logout = async () => {
    try {
      await httpNode.post('/logout');
    } catch {
      // Ignora erro no logout
    }
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
