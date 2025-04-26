import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

   useEffect(() => {
    const reqInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => { 
        if (error.response && error.response.status === 401) {
          console.error("Interceptor detected 401, logging out.");
          localStorage.removeItem("token");
          setUser(null); 
          navigate("/login"); 
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(reqInterceptor);
      axiosInstance.interceptors.response.eject(resInterceptor);
    };
  }, [navigate]);


  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout server error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
       if (window.location.pathname !== '/login') {
         navigate("/login");
       }
    }
  }, [navigate, setLoading, setUser]);


  const login = useCallback(async (token) => {
    setLoading(true);
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
      await logout(); 
    } finally {
       setLoading(false);
    }
  }, [logout, setLoading, setUser]); 

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        setLoading(true);
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
             console.log("Token expired, refreshing...");
            try {
              const res = await axiosInstance.post("/auth/refresh", { token });
              if (res.status === 200) {
                const newToken = res.data.token;
                 console.log("Token refreshed successfully.");
                await login(newToken);
              } else {
                 console.log("Token refresh failed (non-200 status), logging out...");
                 await logout();
              }
            } catch (refreshError) {
               console.error("Token refresh failed, logging out...", refreshError);
               await logout();
            }
          } else {
             console.log("Token is valid, fetching user data...");
             await login(token);
          }
        } catch (error) {
           console.error("Error checking/decoding token:", error);
           await logout();
        }
      } else {
         setUser(null);
         setLoading(false);
      }
    };

    checkToken();
  }, [login, logout, setLoading, setUser]);


  const updateWalletBalance = useCallback((newBalance) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, walletBalance: newBalance };
    });
  }, [setUser]);

  const updateXp = useCallback((newXp) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, xp: newXp };
    });
  }, [setUser]);

  const updateBonusClaimStatus = useCallback((newBalance, claimTime) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, walletBalance: newBalance, dailyBonusClaimed: claimTime };
    });
  }, [setUser]);


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