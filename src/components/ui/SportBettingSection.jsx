import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, Spinner } from "flowbite-react";
import { useTranslation } from "react-i18next";

const USE_MOCK_DATA = true;

const mockMatches = [
  { id: 1, homeTeam: "Real Madrid", homeLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg", awayTeam: "Barcelona", awayLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg", date: new Date(Date.now() + 3600000).toISOString(), timezone: "UTC", },
  { id: 2, homeTeam: "Atletico Madrid", homeLogo: "https://upload.wikimedia.org/wikipedia/en/c/c1/Atletico_Madrid_logo.svg", awayTeam: "Sevilla", awayLogo: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg", date: new Date(Date.now() + 7200000).toISOString(), timezone: "UTC", },
  { id: 3, homeTeam: "Valencia", homeLogo: "https://upload.wikimedia.org/wikipedia/sco/c/ce/Valenciacf.svg", awayTeam: "Villarreal", awayLogo: "https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg", date: new Date(Date.now() + 10800000).toISOString(), timezone: "UTC", },
  { id: 4, homeTeam: "Manchester United", homeLogo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg", awayTeam: "Liverpool", awayLogo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg", date: new Date(Date.now() + 14400000).toISOString(), timezone: "UTC", },
  { id: 5, homeTeam: "Bayern Munich", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg", awayTeam: "Borussia Dortmund", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg", date: new Date(Date.now() + 18000000).toISOString(), timezone: "UTC", },
  { id: 6, homeTeam: "Paris Saint-Germain", homeLogo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg", awayTeam: "Olympique Marseille", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg", date: new Date(Date.now() + 21600000).toISOString(), timezone: "UTC", },
  { id: 7, homeTeam: "Juventus", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg", awayTeam: "Inter Milan", awayLogo: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg", date: new Date(Date.now() + 25200000).toISOString(), timezone: "UTC", },
  { id: 8, homeTeam: "AC Milan", homeLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg", awayTeam: "AS Roma", awayLogo: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg", date: new Date(Date.now() + 28800000).toISOString(), timezone: "UTC", },
];

const MatchCard = ({ match }) => {
  const { t } = useTranslation();

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://dummyimage.com/60x60/cccccc/000.png&text=N/A";
  };

  const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try { return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
     catch(e) { return 'Invalid Date'; }
  };
  const formatTime = (dateString) => {
     if (!dateString) return 'N/A';
     try { return new Date(dateString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }); }
     catch(e) { return 'Invalid Time'; }
  }

  return (
    <div className="flex flex-col items-center bg-white/5 dark:bg-slate-800/60 backdrop-blur-lg border border-white/10 dark:border-slate-700/50 rounded-xl shadow-lg p-4 sm:p-5 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex flex-col items-center w-2/5 text-center">
          <img
            src={match?.homeLogo ?? "https://dummyimage.com/60x60/cccccc/000.png&text=N/A"}
            alt={match?.homeTeam ?? 'Home Team'}
            onError={handleImageError}
            className="w-10 h-10 sm:w-12 sm:h-12 mb-2 object-contain"
            loading="lazy"
          />
          <h5 className="text-sm sm:text-base font-semibold text-gray-100 dark:text-white break-words line-clamp-2">
            {match?.homeTeam ?? 'N/A'}
          </h5>
        </div>

        <div className="flex flex-col items-center px-1 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-400 mb-0.5">
              {formatDate(match?.date)}
          </span>
          <span className="text-lg sm:text-xl font-bold text-gray-300 dark:text-gray-200 bg-white/10 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
            {formatTime(match?.date)}
          </span>
           <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
             {match?.timezone ?? 'UTC'}
          </span>
        </div>

        <div className="flex flex-col items-center w-2/5 text-center">
          <img
            src={match?.awayLogo ?? "https://dummyimage.com/60x60/cccccc/000.png&text=N/A"}
            alt={match?.awayTeam ?? 'Away Team'}
            onError={handleImageError}
            className="w-10 h-10 sm:w-12 sm:h-12 mb-2 object-contain"
            loading="lazy"
          />
          <h5 className="text-sm sm:text-base font-semibold text-gray-100 dark:text-white break-words line-clamp-2">
            {match?.awayTeam ?? 'N/A'}
          </h5>
        </div>
      </div>
    </div>
  );
};

const SportBettingSection = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
     if (USE_MOCK_DATA) {
      let extendedMatches = [...mockMatches];
      while (extendedMatches.length > 0 && extendedMatches.length < 8) {
          extendedMatches = [...extendedMatches, ...mockMatches.map(m => ({...m, id: `${m.id}-${extendedMatches.length}`}))];
      }
      setMatches(extendedMatches);
      setLoading(false);
    } else {
        setError("API data fetching is disabled in this example.");
        setLoading(false);
    }
  }, []);

  const itemsToScroll = 1;
  const totalItems = matches.length;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex - itemsToScroll + totalItems) % totalItems
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex + itemsToScroll) % totalItems
    );
  };

  const translatePercentage = useMemo(() => {
      const itemsVisibleApprox = 4.5;
      const itemBasisPercent = 100 / itemsVisibleApprox;
      return currentIndex * -itemBasisPercent;
  }, [currentIndex, totalItems]);


  if (loading) {
    return (
      <div className="w-full bg-slate-800/50 rounded-lg p-4 flex justify-center items-center h-64 my-4">
        <Spinner size="xl" color="info" />
        <span className="ml-3 text-gray-300">{t('loading_matches', 'Loading matches...')}</span>
      </div>
    );
  }
  if (error) {
     return (
       <div className="w-full bg-red-900/30 rounded-lg p-4 text-center text-red-400 my-4">{error}</div>
     );
   }
  if (matches.length === 0) {
     return (
       <div className="w-full bg-slate-800/50 rounded-lg p-4 text-center text-gray-400 my-4">{t('no_matches_found', 'No upcoming matches found.')}</div>
     );
   }

   return (
    <div className="w-full group my-6 relative">
  
      <div className="relative">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                     text-white rounded-full p-2 z-20
                     transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-110 focus:outline-none"
          aria-label="Previous match"
        >
          <ChevronLeft size={32} />
        </button>
  
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${translatePercentage}%)` }}
          >
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex-shrink-0 w-full basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-2 sm:px-3"
              >
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
  
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full
                     text-white rounded-full p-2 z-20
                     transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-110 focus:outline-none"
          aria-label="Next match"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );  
};

export default SportBettingSection;