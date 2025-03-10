import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();  

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ userName: decodedToken.user.userName });
      } catch (error) {
        console.error("Érvénytelen token!", error);
      }
    }
  }, []);

  const login = (token) => {
    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
    localStorage.setItem("token", token);
    setUser({ userName: decodedToken.user.userName });
    navigate("/"); 
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);