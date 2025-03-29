import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WarningAlert from "./WarningAlert";

const GameCarousel = ({ games }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleGames, setVisibleGames] = useState([]);

  useEffect(() => {
    if (!games || games.length === 0) return;

    let gamesToDisplay = [...games];
    while (gamesToDisplay.length < 6) {
      gamesToDisplay = [...gamesToDisplay, ...games];
    }

    const visibleOnes = [];
    for (let i = 0; i < 6; i++) {
      const index = (currentIndex + i) % gamesToDisplay.length;
      visibleOnes.push(gamesToDisplay[index]);
    }

    setVisibleGames(visibleOnes);
  }, [currentIndex, games]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return games.length - 1;
      }
      return prevIndex - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length);
  };

  const placeholderGames = [
    {
      imageSrc: "/api/placeholder/200/300",
      altText: "Game 1",
      root: "game1",
      requiresAuth: true,
    },
    {
      imageSrc: "/api/placeholder/200/300",
      altText: "Game 2",
      root: "game2",
      requiresAuth: true,
    },
    {
      imageSrc: "/api/placeholder/200/300",
      altText: "Game 3",
      root: "game3",
      requiresAuth: false,
    },
    {
      imageSrc: "/api/placeholder/200/300",
      altText: "Game 4",
      root: "game4",
      requiresAuth: true,
    },
    {
      imageSrc: "/api/placeholder/200/300",
      altText: "Game 5",
      root: "game5",
      requiresAuth: false,
    },
    {
      imageSrc: "/api/placeholder/200/300",
      altText: "Game 6",
      root: "game6",
      requiresAuth: true,
    },
  ];

  const displayGames =
    visibleGames.length > 0 ? visibleGames : placeholderGames;

  return (
    <div className="relative w-full py-4">
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg p-2 z-10"
        aria-label="Previous games"
      >
        <ChevronLeft size={38} />
      </button>

      <div className="flex justify-between items-center px-12 gap-4 overflow-hidden">
        {displayGames.map((game, index) => (
          <div key={index} className="w-full flex-1 min-w-0">
            <GameCard
              imageSrc={game.imageSrc}
              altText={game.altText}
              root={game.root}
              requiresAuth={game.requiresAuth}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg p-2 z-10"
        aria-label="Next games"
      >
        <ChevronRight size={38} />
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
        className="max-w-sm rounded-lg cursor-pointer hover:scale-102 transition-all duration-300 mx-auto my-2"
        onClick={handleClick}
      >
        <img
          className="rounded-lg w-50 h-70 mx-auto"
          src={imageSrc}
          alt={altText}
        />
      </div>
    </>
  );
};

export default GameCarousel;
