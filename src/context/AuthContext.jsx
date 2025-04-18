import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../utils/axios";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const response = await axiosInstance.get("/data/userdata", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const { username, xp, role, wallet } = response.data.user;
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log("Token expired, logging out");
            logout();
          } else {
            setUser({
              userName: username,
              role: role,
              xp: xp,
              walletBalance: wallet.balance,
              dailyBonusClaimed: wallet.dailyBonusClaimed,
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

  const login = async (token) => {
    try {
      const response = await axiosInstance.get("/data/userdata", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { username, xp, role, wallet } = response.data.user;
      localStorage.setItem("token", token);
      setUser({
        userName: username,
        role: role,
        xp: xp,
        walletBalance: wallet.balance,
        dailyBonusClaimed: wallet.dailyBonusClaimed,
      });
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
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        walletBalance: newBalance,
      };
    });
  };

  const updateXp = (newXp) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        xp: newXp,
      };
    });
  };

  const updateBonusClaimStatus = (newBalance, claimTime) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        walletBalance: newBalance,
        dailyBonusClaimed: claimTime,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        updateWalletBalance,
        updateBonusClaimStatus,
        updateXp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
