import { createContext, useEffect, useState, useContext } from "react";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const eventSource = new EventSource(
      `http://localhost:5001/user/event?token=${token}`
    );

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData && parsedData.userData) {
          setUserData(parsedData.userData);
        } else {
          console.warn(
            "Received SSE message without userData field:",
            parsedData
          );
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("An error occurred with the EventSource.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log("EventSource connection closed.");
    };
  }, [user]);

  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
