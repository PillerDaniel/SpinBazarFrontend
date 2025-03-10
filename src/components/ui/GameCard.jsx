import React from 'react';

const GameCard = ({ imageSrc, altText }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg">
      <img 
        src={imageSrc}
        alt={altText}
        className="w-full h-64 object-cover rounded-lg mb-4 transition-transform duration-300 ease-in-out transform hover:scale-110"
      />
    </div>
  );
};

export default GameCard;
