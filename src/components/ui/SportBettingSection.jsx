import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, Spinner } from "flowbite-react";

const SportBettingSection = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const carouselRef = useRef(null);

  useEffect(() => {
    const updateVisibleCards = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.offsetWidth;
        const cardsToShow = Math.max(1, Math.floor(containerWidth / 350));
        setVisibleCards(Math.min(cardsToShow, 5));
      }
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  useEffect(() => {
    const fetchLaLigaMatches = async () => {
      const options = {
        method: "GET",
        url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
        params: { league: "140", season: "2024" },
        headers: {
          "X-RapidAPI-Key":
            "36c318f0a4msh9711a935c650148p1e00cejsn042ab037588c",
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      };

      try {
        setLoading(true);
        const response = await axios.request(options);

        const now = new Date();
        const futureMatches = response.data.response.filter(
          (match) => new Date(match.fixture.date) > now
        );

        const processedMatches = futureMatches.map((match) => ({
          id: match.fixture.id,
          homeTeam: match.teams.home.name,
          homeLogo: match.teams.home.logo,
          awayTeam: match.teams.away.name,
          awayLogo: match.teams.away.logo,
          date: match.fixture.date,
          referee: match.fixture.referee || "N/A",
          timezone: match.fixture.timezone,
          status: match.fixture.status.short || "N/A",
        }));

        setMatches(processedMatches);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError("Failed to fetch live matches");
        setLoading(false);
      }
    };

    fetchLaLigaMatches();

    const intervalId = setInterval(fetchLaLigaMatches, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return matches.length - visibleCards;
      }
      return Math.max(0, prev - visibleCards);
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev + visibleCards >= matches.length) {
        return 0;
      }
      return prev + visibleCards;
    });
  };

  useEffect(() => {
    if (matches.length <= visibleCards) return;

    const autoScroll = setInterval(handleNext, 5000);
    return () => clearInterval(autoScroll);
  }, [matches, visibleCards]);

  if (loading) {
    return (
      <Card className="w-full">
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <div className="text-center text-red-500">{error}</div>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="w-full">
        <div className="text-center">No upcoming matches found</div>
      </Card>
    );
  }

  return (
    <div className="relative w-full py-4" ref={carouselRef}>
      {/* Left Arrow - only show if there are more matches */}
      {matches.length > visibleCards && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg p-2 z-10"
          aria-label="Previous games"
        >
          <ChevronLeft size={38} />
        </button>
      )}

      {/* Match Cards Carousel */}
      <div className="flex justify-center items-center px-12 gap-4 overflow-hidden">
        {matches
          .slice(currentIndex, currentIndex + visibleCards)
          .map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
      </div>

      {/* Right Arrow - only show if there are more matches */}
      {matches.length > visibleCards && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg p-2 z-10"
          aria-label="Next games"
        >
          <ChevronRight size={38} />
        </button>
      )}
    </div>
  );
};

// Updated Match Card Component with better text handling
const MatchCard = ({ match }) => {
  return (
    <div className="flex-shrink-0 w-[400px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-4 transition-transform duration-300 hover:scale-105">
      <div className="flex flex-col items-center">
        {/* Teams Row */}
        <div className="flex items-center justify-between w-full mb-4">
          {/* Home Team */}
          <div className="flex flex-col items-center w-2/5">
            <img
              src={match.homeLogo}
              alt={match.homeTeam}
              className="w-12 h-12 mb-2 object-contain"
            />
            <h5 className="text-lg font-bold text-gray-900 dark:text-white text-center w-full break-words">
              {match.homeTeam}
            </h5>
          </div>

          {/* VS Separator */}
          <div className="mx-2 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
              VS
            </span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center w-2/5">
            <img
              src={match.awayLogo}
              alt={match.awayTeam}
              className="w-12 h-12 mb-2 object-contain"
            />
            <h5 className="text-lg font-bold text-gray-900 dark:text-white text-center w-full break-words">
              {match.awayTeam}
            </h5>
          </div>
        </div>

        {/* Match Details */}
        <div className="w-full space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Date:</span>{" "}
            {new Date(match.date).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Referee:</span> {match.referee}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Status:</span> {match.status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SportBettingSection;
