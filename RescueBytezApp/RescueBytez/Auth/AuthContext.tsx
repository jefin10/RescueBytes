import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { STORAGE_KEYS, getData, storeData, clearAllData } from './storage';
import axios from 'axios';
import { API_URL } from './api';

interface UserData {
  userId: string;
  role: string;
  rescueCenter?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  userData: UserData | null;
  login: (userId: string, sessionToken: string, role: string, rescueCenter?: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  userData: null,
  login: async () => false,
  logout: async () => false
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  const validateSessionToken = async (token: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/auth/validate-session`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.isValid;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const [sessionToken, userId, userRole, rescueCenter] = await Promise.all([
          getData(STORAGE_KEYS.SESSION_TOKEN),
          getData(STORAGE_KEYS.USER_ID),
          getData(STORAGE_KEYS.USER_ROLE),
          getData(STORAGE_KEYS.RESCUE_CENTER)
        ]);

        if (sessionToken && userId) {
          const isValid = await validateSessionToken(sessionToken);
          if (isValid) {
            setIsAuthenticated(true);
            setUserData({
              userId,
              role: userRole || 'user',
              rescueCenter: rescueCenter || undefined
            });
          } else {
            await clearAllData();
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (userId: string, sessionToken: string, role: string, rescueCenter?: string): Promise<boolean> => {
    try {
      // Create an array of promises for storage operations
      const storagePromises = [
        storeData(STORAGE_KEYS.USER_ID, userId),
        storeData(STORAGE_KEYS.SESSION_TOKEN, sessionToken),
        storeData(STORAGE_KEYS.USER_ROLE, role)
      ];
      
      // Only add rescueCenter to storage if it exists
      if (rescueCenter) {
        storagePromises.push(storeData(STORAGE_KEYS.RESCUE_CENTER, rescueCenter));
      }
      
      await Promise.all(storagePromises);
      
      setUserData({ userId, role, rescueCenter });
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const token = await getData(STORAGE_KEYS.SESSION_TOKEN);
      if (token) {
        await axios.post(`${API_URL}/auth/logout-mobile`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      await clearAllData();
      setIsAuthenticated(false);
      setUserData(null);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
