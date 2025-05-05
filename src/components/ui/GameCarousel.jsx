import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WarningAlert from "./WarningAlert";

const GameCarousel = ({ games }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleGames, setVisibleGames] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const handleResize = () => {
 if (window.innerWidth < 768) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(6);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!games || games.length === 0) {
      setVisibleGames([]);
      return;
    }

    let gamesToDisplay = [...games];
    while (gamesToDisplay.length > 0 && gamesToDisplay.length < visibleCount) {
      gamesToDisplay = [...gamesToDisplay, ...games];
    }
    gamesToDisplay = gamesToDisplay.slice(0, Math.max(games.length, visibleCount));

    const visibleOnes = [];
    if (gamesToDisplay.length > 0) {
      for (let i = 0; i < visibleCount; i++) {
        const index = (currentIndex + i) % gamesToDisplay.length;
        visibleOnes.push(gamesToDisplay[index]);
      }
    }

    setVisibleGames(visibleOnes);
  }, [currentIndex, games, visibleCount]);

  if (!visibleGames || visibleGames.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      if (!games || games.length === 0) return 0;
      return (prevIndex - 1 + games.length) % games.length;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      if (!games || games.length === 0) return 0;
      return (prevIndex + 1) % games.length;
    });
  };

  return (
    <div className="relative w-full py-4">
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg p-2 z-10 transition-transform duration-300 hover:scale-105"
        aria-label="Previous games"
      >
        <ChevronLeft size={24} className="sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
      </button>

      <div className="flex justify-between items-center px-12 gap-2 md:gap-4 overflow-hidden">
        {visibleGames.map((game, index) => (
          <div key={index} className="w-full flex-1 min-w-0">
            {game && (
              <GameCard
                imageSrc={game.imageSrc}
                altText={game.altText}
                root={game.root}
                requiresAuth={game.requiresAuth}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg p-2 z-10 transition-transform duration-300 hover:scale-105"
        aria-label="Next games"
      >
        <ChevronRight size={24} className="sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
      </button>
    </div>
  );
};

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
        className="rounded-lg cursor-pointer hover:scale-105 transition-all duration-300 mx-auto my-2"
        onClick={handleClick}
      >
        <img
          className="rounded-lg w-55 h-auto mx-auto object-contain"
          src={imageSrc}
          alt={altText}
        />
      </div>
    </>
  );
};

export default GameCarousel;