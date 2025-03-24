import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import WarningAlert from "../components/ui/WarningAlert";
import { useNavigate } from "react-router-dom";

function ProtectedRoutes({ children, adminOnly = false }) {
  const { user } = useAuth();
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setAlertMessage("Log in to access the page.");
    } else if (adminOnly && user.role !== 'admin') {
      setAlertMessage("You do not have permission to access this page.");
      navigate('/');
    }
  }, [user, adminOnly, navigate]);

  if (!user) {
    return (
      <WarningAlert
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />
    );
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <WarningAlert
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />
    );
  }

  return children;
}

export default ProtectedRoutes;