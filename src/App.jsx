import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import { AuthProvider } from "./context/AuthContext";
import "../i18n.js";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/HomePage";
import Blackjack from "./pages/Blackjack";
import Roulette from "./pages/Roulette";
import AdminDashboard from "./pages/AdminDashboard";
import GameStatistics from "./pages/Statistics.jsx";
import Profile from "./pages/Profile.jsx";
import Casino from "./pages/Casino.jsx";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/casino" element={<Casino />} />
          <Route
            path="/blackjack"
            element={
              <ProtectedRoutes>
                <Blackjack />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/roulette"
            element={
              <ProtectedRoutes>
                <Roulette />
              </ProtectedRoutes>
            }
          />
          <Route path="/statistics" element={<GameStatistics />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoutes adminOnly={true}>
                <AdminDashboard/>
              </ProtectedRoutes>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
