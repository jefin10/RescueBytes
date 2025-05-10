import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api_url from "../api.tsx";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check if user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch(`${api_url}/auth/check`, {
        method: "GET",
        credentials: "include", // Sends cookies with the request
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle login
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${api_url}/auth/login`, {
        method: "POST",
        credentials: "include", // Ensures cookies are stored
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setIsAuthenticated(true);
      navigate("/home"); // Redirect to home after login
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      await fetch(`${api_url}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setIsAuthenticated(false);
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
      {!loading && children} {/* Prevent rendering until auth check completes */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
