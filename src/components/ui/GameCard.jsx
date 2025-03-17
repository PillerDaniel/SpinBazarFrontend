import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameCard = ({ imageSrc, altText, root }) => {
    const navigate = useNavigate();

    const navigateToPage = () => {
      navigate(`/${root}`);
    };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg">
      <img 
        src={imageSrc}
        alt={altText}
        onClick={navigateToPage}
        className="w-full h-64 object-cover rounded-lg mb-4 transition-transform duration-300 ease-in-out transform hover:scale-110"
      />
    </div>
  );
};

export default GameCard;
