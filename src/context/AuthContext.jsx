import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const AuthContext = createContext();  

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Setup axios interceptors when the component mounts
  useEffect(() => {
    // Request interceptor to add token to all requests
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle authentication errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          logout();
        }
        return Promise.reject(error);
      }
    );
  }, []);

  // Check for token and validate on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log("Token expired, logging out");
            logout();
          } else {
            setUser({ 
              userName: decodedToken.user.userName,
              walletBalance: decodedToken.user.wallet.balance
            });
          }
        } catch (error) {
          console.error("Invalid token!", error);
          logout();
        }
      }
      
      setLoading(false);
    };

    checkToken();
  }, []);

  const login = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      localStorage.setItem("token", token);
      setUser({ 
        userName: decodedToken.user.userName,
        walletBalance: decodedToken.user.wallet.balance
      });
      navigate("/"); 
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const updateWalletBalance = (newBalance) => {
    setUser(prevUser => ({
      ...prevUser,
      walletBalance: newBalance
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      loading,
      updateWalletBalance 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);