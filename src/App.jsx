import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import { AuthProvider } from "./context/AuthContext";
import "../i18n.js";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/HomePage";
import Blackjack from "./pages/Blackjack";
import Mines from "./pages/Mines.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import GameStatistics from "./pages/Statistics.jsx";
import Profile from "./pages/Profile.jsx";
import Casino from "./pages/Casino.jsx";
import AlertNotFound from "./components/ui/AlertNotFound.jsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="*" element={<AlertNotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoutes adminOnly={false}>
                <Profile />
              </ProtectedRoutes>
            }
          />
          <Route path="/casino" element={<Casino />} />
          <Route
            path="/blackjack"
            element={
              <ProtectedRoutes adminOnly={false}>
                <Blackjack />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/mines"
            element={
              <ProtectedRoutes adminOnly={false}>
                <Mines />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoutes adminOnly={false}>
                <GameStatistics />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoutes adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/admin/userprofile/:id"
            element={
              <ProtectedRoutes adminOnly={true}>
                <Profile />
              </ProtectedRoutes>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
