import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WarningAlert from './WarningAlert';

const GameCard = ({ imageSrc, altText, root, requiresAuth = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [alertMessage, setAlertMessage] = useState("");

    const handleClick = () => {
      if (requiresAuth && !user) {
        setAlertMessage("Log in to access the page.");
        return;
      }
      
      if (root) {
        navigate(`/${root}`);
      }
    };

  return (
    <>
      {alertMessage && (
        <WarningAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      )}
      <div 
        className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:scale-105 transition-all duration-300"
        onClick={handleClick}
      >
        <img className="rounded-lg" src={imageSrc} alt={altText} />
      </div>
    </>
  );
};

export default GameCard;