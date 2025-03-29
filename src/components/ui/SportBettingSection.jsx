import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, Spinner } from "flowbite-react";

const USE_MOCK_DATA = true;

const mockMatches = [
  {
    id: 1,
    homeTeam: "Real Madrid",
    homeLogo:
      "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    awayTeam: "Barcelona",
    awayLogo:
      "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    date: new Date(Date.now() + 3600000).toISOString(),
    referee: "John Doe",
    timezone: "UTC",
    status: "NS",
  },
  {
    id: 2,
    homeTeam: "Atletico Madrid",
    homeLogo:
      "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_logo.svg",
    awayTeam: "Sevilla",
    awayLogo:
      "https://upload.wikimedia.org/wikipedia/en/3/3f/Sevilla_FC.svg",
    date: new Date(Date.now() + 7200000).toISOString(),
    referee: "Jane Smith",
    timezone: "UTC",
    status: "NS",
  },
  {
    id: 3,
    homeTeam: "Valencia",
    homeLogo:
      "https://upload.wikimedia.org/wikipedia/en/c/cf/Valencia_CF.svg",
    awayTeam: "Villarreal",
    awayLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2e/Villarreal_CF_logo.svg",
    date: new Date(Date.now() + 10800000).toISOString(),
    referee: "Alex Brown",
    timezone: "UTC",
    status: "NS",
  },
];

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
    if (USE_MOCK_DATA) {
      setMatches(mockMatches);
      setLoading(false);
    } else {
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
    }
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
      {matches.length > visibleCards && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg p-2 z-10"
          aria-label="Previous games"
        >
          <ChevronLeft size={38} />
        </button>
      )}

      <div className="flex justify-center items-center px-12 gap-4 overflow-hidden">
        {matches
          .slice(currentIndex, currentIndex + visibleCards)
          .map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
      </div>

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

const MatchCard = ({ match }) => {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://dummyimage.com/50x50/000/fff.png&text=Logo";
  };
  

  return (
    <div className="flex-shrink-0 w-[400px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-4 transition-transform duration-300 hover:scale-105">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex flex-col items-center w-2/5">
            <img
              src={match.homeLogo}
              alt={match.homeTeam}
              onError={handleImageError}
              className="w-12 h-12 mb-2 object-contain"
            />
            <h5 className="text-lg font-bold text-gray-900 dark:text-white text-center w-full break-words">
              {match.homeTeam}
            </h5>
          </div>

          <div className="mx-2 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
              VS
            </span>
          </div>

          <div className="flex flex-col items-center w-2/5">
            <img
              src={match.awayLogo}
              alt={match.awayTeam}
              onError={handleImageError}
              className="w-12 h-12 mb-2 object-contain"
            />
            <h5 className="text-lg font-bold text-gray-900 dark:text-white text-center w-full break-words">
              {match.awayTeam}
            </h5>
          </div>
        </div>

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
