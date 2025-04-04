import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../utils/axios";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { useTranslation } from "react-i18next";
import { Card, Table, Badge, Dropdown, Spinner, Alert, Pagination } from "flowbite-react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ITEMS_PER_PAGE = 20;

const GameStatistics = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get(
          "http://localhost:5001/history/gethistory",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API Response:", response.data);
        const historyData = response.data.history || [];
        setHistory(historyData);

        const uniqueGames = [
          "All Games",
          ...new Set(historyData.map((item) => item.game)),
        ];
        setGames(uniqueGames);

      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load game history. Please try again later.");
        setHistory([]);
        setGames(["All Games"]);
      } finally {
         setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    setLoading(true);
    let filteredData = history;
    if (selectedGame) {
        filteredData = history.filter(item => item.game === selectedGame);
    }
    setFilteredHistory(filteredData);
    setCurrentPage(1);
    setLoading(false);
  }, [history, selectedGame]);


  const filterByGame = (game) => {
    const gameToSet = game === "All Games" ? "" : game;
    setSelectedGame(gameToSet);
  };

  const stats = useMemo(() => {
    const dataToUse = filteredHistory;

    if (!dataToUse || !dataToUse.length) return null;

    const totalGames = dataToUse.length;
    const wins = dataToUse.filter(
      (game) => game.winAmount > game.betAmount
    ).length;
    const losses = dataToUse.filter(
      (game) => game.winAmount <= 0 || game.winAmount < game.betAmount
    ).length;
    const draws = dataToUse.filter(
      (game) => game.winAmount === game.betAmount
    ).length;

    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

    const totalBet = dataToUse.reduce(
      (sum, game) => sum + game.betAmount,
      0
    );
    const totalWin = dataToUse.reduce(
      (sum, game) => sum + game.winAmount,
      0
    );
    const profit = totalWin - totalBet;

    let currentStreak = 0;
    let streakType = null;
    const sortedHistoryForStreak = [...dataToUse].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (sortedHistoryForStreak.length > 0) {
      const firstGame = sortedHistoryForStreak[0];
       streakType =
        firstGame.winAmount > firstGame.betAmount
          ? "win"
          : firstGame.winAmount < firstGame.betAmount || firstGame.winAmount === 0
          ? "loss"
          : "draw";

      for (const game of sortedHistoryForStreak) {
        const result =
          game.winAmount > game.betAmount
            ? "win"
            : game.winAmount < game.betAmount || game.winAmount === 0
            ? "loss"
            : "draw";

        if (result === streakType) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    const bestGame = dataToUse.reduce((best, current) => {
      const currentProfit = current.winAmount - current.betAmount;
      const bestProfit = best ? best.winAmount - best.betAmount : -Infinity;
      return currentProfit > bestProfit ? current : best;
    }, null);

     let favoriteGameName = "N/A";
     let favoriteGamePlays = 0;
     if (dataToUse.length > 0) {
        const gameCounts = dataToUse.reduce((counts, game) => {
            counts[game.game] = (counts[game.game] || 0) + 1;
            return counts;
        }, {});

        let maxPlays = 0;
        for (const gameName in gameCounts) {
            if (gameCounts[gameName] > maxPlays) {
                maxPlays = gameCounts[gameName];
                favoriteGameName = gameName;
                favoriteGamePlays = maxPlays;
            }
        }
     }


    return {
      totalGames,
      wins,
      losses,
      draws,
      winRate,
      totalBet,
      totalWin,
      profit,
      currentStreak,
      streakType,
      bestGame,
      favoriteGame: { name: favoriteGameName, plays: favoriteGamePlays },
    };
  }, [filteredHistory]);

  const resultsChartData = useMemo(() => ({
    labels: ["Wins", "Losses", "Draws"],
    datasets: [
      {
        label: "Game Results",
        data: stats ? [stats.wins, stats.losses, stats.draws] : [0, 0, 0],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }), [stats]);

  const financialChartData = useMemo(() => {
      const sortedData = [...filteredHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
      const lastTenGames = sortedData.slice(-10);

      return {
        labels: lastTenGames.map((item) => new Date(item.date).toLocaleDateString()),
        datasets: [
          {
            label: "Bet Amount",
            data: lastTenGames.map((item) => item.betAmount),
            backgroundColor: "rgba(255, 159, 64, 0.6)",
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 1,
          },
          {
            label: "Win Amount",
            data: lastTenGames.map((item) => item.winAmount),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };
  }, [filteredHistory]);

  const paginatedHistory = useMemo(() => {
    const sorted = [...filteredHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage]);

  const totalPages = useMemo(() => {
      return Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  }, [filteredHistory]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getResultBadge = (betAmount, winAmount) => {
    if (typeof betAmount !== 'number' || typeof winAmount !== 'number') {
        return <Badge color="info">Unknown</Badge>;
    }

    if (winAmount > betAmount) {
      return <Badge color="success">Win</Badge>;
    } else if (winAmount < betAmount || winAmount === 0) {
      return <Badge color="failure">Loss</Badge>;
    } else if (winAmount === betAmount) {
      return <Badge color="warning">Draw</Badge>;
    } else {
      return <Badge color="info">Unknown</Badge>;
    }
  };

  const getProfit = (betAmount, winAmount) => {
    if (typeof betAmount !== 'number' || typeof winAmount !== 'number') {
        return <span className="text-gray-400">N/A</span>;
    }
    const profit = winAmount - betAmount;
    if (profit > 0) {
      return <span className="text-green-500">+{profit.toFixed(2)}</span>;
    } else if (profit < 0) {
      return <span className="text-red-500">{profit.toFixed(2)}</span>;
    } else {
      return <span className="text-yellow-500">0.00</span>;
    }
  };

  const getTrendIndicator = (value, isPositiveGood = true) => {
      const colorClass = value > 0
        ? (isPositiveGood ? "text-green-500" : "text-red-500")
        : value < 0
        ? (isPositiveGood ? "text-red-500" : "text-green-500")
        : "text-yellow-500";

      const Icon = value > 0
        ? () => <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        : value < 0
        ? () => <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 012 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd" />
        : () => <path fillRule="evenodd" d="M7 10a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />;

      return (
        <div className={`flex items-center ${colorClass}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <Icon />
          </svg>
          <span className="ml-1">{Math.abs(value)}%</span>
        </div>
      );
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-24 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-white">
          {t("Game History Statistics")}
        </h1>

        {error && (
          <Alert color="failure" className="mb-4">
            <span>
              <span className="font-medium">Error!</span> {error}
            </span>
          </Alert>
        )}

        <div className="mb-6">
          <Dropdown
             label={selectedGame || t("All Games")}
             color="dark"
             disabled={loading}
           >
            {games.map((game) => (
              <Dropdown.Item
                 key={game}
                 onClick={() => filterByGame(game)}
                 className="text-gray-200 hover:bg-gray-600"
               >
                 {t(game)}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>

        {loading && !stats ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            {stats && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gray-800 border border-gray-700">
                        <div className="p-4 flex flex-col">
                           <div className="flex justify-between items-center mb-4">
                                <h5 className="text-lg font-semibold tracking-tight text-white">
                                    {t("Total Games")}
                                </h5>
                                <div className="p-2 bg-blue-600 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                </div>
                            </div>
                            <p className="font-normal text-3xl text-gray-200 mb-2">
                                {stats.totalGames}
                            </p>
                         </div>
                    </Card>
                     <Card className="bg-gray-800 border border-gray-700">
                         <div className="p-4 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-lg font-semibold tracking-tight text-white">
                                    {t("Win Rate")}
                                </h5>
                                <div className="p-2 bg-green-600 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                            </div>
                             <p className="font-normal text-3xl text-gray-200 mb-2">
                                {stats.winRate}%
                            </p>
                             <div className="mt-2 flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                    <span className="text-gray-400">W: {stats.wins}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                                    <span className="text-gray-400">L: {stats.losses}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                                    <span className="text-gray-400">D: {stats.draws}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex h-1 rounded-full overflow-hidden bg-gray-700">
                                <div className="bg-green-500" style={{ width: `${(stats.wins / stats.totalGames) * 100}%` }}></div>
                                <div className="bg-red-500" style={{ width: `${(stats.losses / stats.totalGames) * 100}%` }}></div>
                                <div className="bg-yellow-500" style={{ width: `${(stats.draws / stats.totalGames) * 100}%` }}></div>
                             </div>
                         </div>
                     </Card>
                     <Card className="bg-gray-800 border border-gray-700">
                         <div className="p-4 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-lg font-semibold tracking-tight text-white">
                                    {t("Total Bet")}
                                </h5>
                                <div className="p-2 bg-purple-600 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                            <p className="font-normal text-3xl text-gray-200 mb-2">
                                ${stats.totalBet.toFixed(2)}
                            </p>
                             <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                <span>
                                    {t("Avg. Bet")} ${stats.totalGames > 0 ? (stats.totalBet / stats.totalGames).toFixed(2) : '0.00'}
                                </span>
                             </div>
                         </div>
                     </Card>
                     <Card className="bg-gray-800 border border-gray-700">
                         <div className="p-4 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-lg font-semibold tracking-tight text-white">
                                    {t("Net Profit")}
                                </h5>
                                <div className={`p-2 ${stats.profit >= 0 ? "bg-green-600" : "bg-red-600"} rounded-full`}>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                             </div>
                            <p className={`font-normal text-3xl ${stats.profit >= 0 ? "text-green-500" : "text-red-500"} mb-2`}>
                                ${stats.profit.toFixed(2)}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                <span>
                                    {t("ROI")} {stats.totalBet !== 0 ? ((stats.profit / stats.totalBet) * 100).toFixed(1) : '0.0'}%
                                </span>
                             </div>
                         </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gray-800 border border-gray-700">
                        <div className="p-4 flex flex-col">
                            <h5 className="text-lg font-semibold mb-3 text-white">
                                {t("Current Streak")}
                            </h5>
                            <div className="flex items-center">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                                    stats.streakType === "win" ? "bg-green-600"
                                    : stats.streakType === "loss" ? "bg-red-600"
                                    : "bg-yellow-600"
                                }`}>
                                    {stats.currentStreak}
                                </div>
                                <div className="ml-4">
                                    <p className="text-xl text-gray-200 capitalize">
                                        {t(stats.streakType || 'N/A')} Streak
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {t("Last")} {stats.currentStreak} {t("Games")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                     <Card className="bg-gray-800 border border-gray-700">
                        <div className="p-4 flex flex-col">
                            <h5 className="text-lg font-semibold mb-3 text-white">
                                {t("Best Game")} (Max Profit)
                            </h5>
                             {stats.bestGame ? (
                                <div className="flex items-center">
                                    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xl text-gray-200 truncate" title={stats.bestGame.game}>
                                            {stats.bestGame.game}
                                        </p>
                                        <p className="text-base mt-1 text-green-400">
                                             Profit: +${(stats.bestGame.winAmount - stats.bestGame.betAmount).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(stats.bestGame.date)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                 <p className="text-gray-400">{t("No games played yet")}</p>
                             )}
                        </div>
                    </Card>
                     <Card className="bg-gray-800 border border-gray-700">
                        <div className="p-4 flex flex-col">
                             <h5 className="text-lg font-semibold mb-3 text-white">
                                {t("Favorite Game")} (Most Played)
                            </h5>
                             {stats.favoriteGame && stats.favoriteGame.plays > 0 ? (
                                <div className="flex items-center">
                                    <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xl text-gray-200 truncate" title={stats.favoriteGame.name}>
                                             {stats.favoriteGame.name}
                                        </p>
                                        <p className="text-base text-gray-400 mt-1">
                                             {stats.favoriteGame.plays} plays
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                 <p className="text-gray-400">{t("No games played yet")}</p>
                             )}
                         </div>
                    </Card>
                </div>
             </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                <Card className="lg:col-span-4 bg-gray-800 border border-gray-700">
                    <h5 className="text-lg font-semibold mb-2 text-white p-4">
                    {t("Results Distribution")}
                    </h5>
                    <div className="p-4 h-64 flex justify-center items-center">
                    {stats && stats.totalGames > 0 ? (
                        <div className="w-full h-full">
                        <Chart
                            type="pie"
                            data={resultsChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { labels: { color: "#D1D5DB" } }
                                }
                            }}
                        />
                        </div>
                    ) : (
                         <p className="text-gray-400">{t("No data to display")}</p>
                    )}
                    </div>
                </Card>

                <Card className="lg:col-span-8 bg-gray-800 border border-gray-700">
                    <h5 className="text-lg font-semibold mb-2 text-white p-4">
                    {t("Recent Bets & Wins")} (Last 10)
                    </h5>
                    <div className="p-4 h-64 flex justify-center items-center">
                    {filteredHistory.length > 0 ? (
                        <div className="w-full h-full">
                        <Chart
                            type="bar"
                            data={financialChartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    x: { ticks: { color: "#9CA3AF" }, grid: { color: "#4B5563" } },
                                    y: { ticks: { color: "#9CA3AF" }, grid: { color: "#4B5563" } }
                                },
                                plugins: {
                                    legend: { labels: { color: "#D1D5DB" } }
                                }
                             }}
                         />
                        </div>
                     ) : (
                        <p className="text-gray-400">{t("No data to display")}</p>
                     )}
                    </div>
                </Card>
            </div>

            <Card className="bg-gray-800 border border-gray-700 overflow-hidden">
                <h5 className="text-xl font-bold mb-2 text-white p-4">
                    {t("Game History")}
                    {loading && <Spinner size="sm" className="ml-2" />}
                </h5>
                 <div className="overflow-x-auto">
                    <Table striped={true} hoverable={true} id="history-table">
                        <Table.Head className="bg-gray-700">
                            <Table.HeadCell className="text-gray-300">{t("Game")}</Table.HeadCell><Table.HeadCell className="text-gray-300">{t("Date")}</Table.HeadCell><Table.HeadCell className="text-gray-300">{t("Bet Amount")}</Table.HeadCell><Table.HeadCell className="text-gray-300">{t("Win Amount")}</Table.HeadCell><Table.HeadCell className="text-gray-300">{t("Profit/Loss")}</Table.HeadCell><Table.HeadCell className="text-gray-300">{t("Result")}</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y divide-gray-700">
                        {paginatedHistory.length > 0 ? (
                            paginatedHistory.map((item) => (
                            <Table.Row
                                key={item.id || `${item.game}-${item.date}`}
                                className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                            >
                                <Table.Cell className="whitespace-nowrap font-medium text-white">{item.game}</Table.Cell><Table.Cell className="text-gray-400">{formatDate(item.date)}</Table.Cell><Table.Cell className="text-gray-400">${item.betAmount?.toFixed(2)}</Table.Cell><Table.Cell className="text-gray-400">${item.winAmount?.toFixed(2)}</Table.Cell><Table.Cell className="text-gray-400">{getProfit(item.betAmount, item.winAmount)}</Table.Cell><Table.Cell>{getResultBadge(item.betAmount, item.winAmount)}</Table.Cell>
                            </Table.Row>
                            ))
                        ) : (
                             <Table.Row className="bg-gray-800">
                                <Table.Cell colSpan={6} className="text-center py-4 text-gray-400">
                                    {loading ? t("Loading history...") : t("No game history found for the selected filter.")}
                                </Table.Cell>
                            </Table.Row>
                        )}
                        </Table.Body>
                    </Table>
                </div>

                {totalPages > 1 && (
                <div className="flex justify-center items-center pt-4 pb-2">
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showIcons={true}
                     theme={{
                         pages: {
                             base: "xs:mt-0 mt-2 inline-flex items-center -space-x-px",
                             showIcon: "inline-flex",
                             previous: {
                                 base: "ml-0 rounded-l-lg border border-gray-700 bg-gray-800 py-2 px-3 leading-tight text-gray-400 enabled:hover:bg-gray-700 enabled:hover:text-white",
                                 icon: "h-5 w-5",
                             },
                             next: {
                                 base: "rounded-r-lg border border-gray-700 bg-gray-800 py-2 px-3 leading-tight text-gray-400 enabled:hover:bg-gray-700 enabled:hover:text-white",
                                 icon: "h-5 w-5",
                             },
                             selector: {
                                 base: "w-12 border border-gray-700 bg-gray-800 py-2 leading-tight text-gray-400 enabled:hover:bg-gray-700 enabled:hover:text-white",
                                 active: "bg-cyan-700 text-white hover:bg-cyan-800 hover:text-white",
                                 disabled: "opacity-50 cursor-normal",
                             },
                         },
                     }}
                    />
                </div>
                )}
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default GameStatistics;