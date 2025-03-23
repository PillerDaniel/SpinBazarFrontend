import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import WarningAlert from "../components/ui/WarningAlert";

function ProtectedRoutes({ children }) {
  const { user } = useAuth();
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setAlertMessage("Log in to access the page.");
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <WarningAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      </>
    );
  }
  return children;
}

export default ProtectedRoutes;
