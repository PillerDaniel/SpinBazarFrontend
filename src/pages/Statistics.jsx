import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { Card, Table, Badge, Dropdown, Spinner, Alert } from "flowbite-react";
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

const GameStatistics = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

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
        setFilteredHistory(historyData);

        const uniqueGames = [...new Set(historyData.map((item) => item.game))];
        setGames(uniqueGames);

        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load game history. Please try again later.");
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filterByGame = async (game) => {
    setLoading(true);
    try {
      if (game) {
        const response = await axiosInstance.get("/history/gethistory", {
          data: { game },
        });
        setFilteredHistory(response.data.history);
        setSelectedGame(game);
      } else {
        setFilteredHistory(history);
        setSelectedGame("");
      }
    } catch (err) {
      setError("Failed to filter game history. Please try again later.");
    }
    setLoading(false);
  };

  const calculateStats = () => {
    if (!filteredHistory || !filteredHistory.length) return null;

    const totalGames = filteredHistory.length;
    const wins = filteredHistory.filter(
      (game) => game.winAmount > game.betAmount
    ).length;
    const losses = filteredHistory.filter(
      (game) => game.winAmount <= 0 || game.winAmount < game.betAmount
    ).length;
    const draws = filteredHistory.filter(
      (game) => game.winAmount === game.betAmount
    ).length;

    const winRate = ((wins / totalGames) * 100).toFixed(1);

    const totalBet = filteredHistory.reduce(
      (sum, game) => sum + game.betAmount,
      0
    );
    const totalWin = filteredHistory.reduce(
      (sum, game) => sum + game.winAmount,
      0
    );
    const profit = totalWin - totalBet;

    let currentStreak = 0;
    let streakType = null;

    const sortedHistory = [...filteredHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (sortedHistory.length > 0) {
      const firstGame = sortedHistory[0];
      streakType =
        firstGame.winAmount > firstGame.betAmount
          ? "win"
          : firstGame.winAmount < firstGame.betAmount
          ? "loss"
          : "draw";

      for (const game of sortedHistory) {
        const result =
          game.winAmount > game.betAmount
            ? "win"
            : game.winAmount < game.betAmount
            ? "loss"
            : "draw";

        if (result === streakType) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    const bestGame = filteredHistory.reduce((best, current) => {
      const currentProfit = current.winAmount - current.betAmount;
      const bestProfit = best ? best.winAmount - best.betAmount : 0;
      return currentProfit > bestProfit ? current : best;
    }, null);

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
    };
  };

  const stats = calculateStats();

  const resultsChartData = {
    labels: ["Wins", "Losses", "Draws"],
    datasets: [
      {
        label: "Game Results",
        data: stats ? [stats.wins, stats.losses, stats.draws] : [],
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
  };

  const financialChartData = {
    labels:
      filteredHistory && filteredHistory.length > 0
        ? filteredHistory
            .slice(-10)
            .map((item) => new Date(item.date).toLocaleDateString())
        : [],
    datasets: [
      {
        label: "Bet Amount",
        data:
          filteredHistory && filteredHistory.length > 0
            ? filteredHistory.slice(-10).map((item) => item.betAmount)
            : [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
      {
        label: "Win Amount",
        data:
          filteredHistory && filteredHistory.length > 0
            ? filteredHistory.slice(-10).map((item) => item.winAmount)
            : [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getResultBadge = (betAmount, winAmount) => {
    if (winAmount > betAmount) {
      return <Badge color="success">Win</Badge>;
    } else if (winAmount === 0 || winAmount < betAmount) {
      return <Badge color="failure">Loss</Badge>;
    } else if (winAmount === betAmount) {
      return <Badge color="warning">Draw</Badge>;
    } else {
      return <Badge color="info">Unknown</Badge>;
    }
  };

  const getProfit = (betAmount, winAmount) => {
    const profit = winAmount - betAmount;
    if (profit > 0) {
      return <span className="text-green-600">+{profit}</span>;
    } else if (profit < 0) {
      return <span className="text-red-600">{profit}</span>;
    } else {
      return <span className="text-yellow-600">0</span>;
    }
  };

  const getTrendIndicator = (value, isPositiveGood = true) => {
    if (value > 0) {
      return (
        <div
          className={`flex items-center ${
            isPositiveGood ? "text-green-500" : "text-red-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-1">{Math.abs(value)}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div
          className={`flex items-center ${
            isPositiveGood ? "text-red-500" : "text-green-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 112 0v5a1 1 0 01-1 1h-5z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-1">{Math.abs(value)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-yellow-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7 10a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-1">0%</span>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="container  mx-auto px-4 pt-30 pb-24 flex-grow">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Game History Statistics
        </h1>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="mb-6">
          <Dropdown label={selectedGame || "All Games"} color="dark">
            <Dropdown.Item onClick={() => filterByGame("")}>
              All Games
            </Dropdown.Item>
            {games.map((game) => (
              <Dropdown.Item key={game} onClick={() => filterByGame(game)}>
                {game}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xl font-bold tracking-tight text-white">
                        Total Games
                      </h5>
                      <div className="p-2 bg-blue-600 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="font-normal text-4xl text-gray-200 mb-2">
                      {stats.totalGames}
                    </p>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-gray-400">Total Sessions</span>
                      <div className="ml-auto">{getTrendIndicator(10)}</div>
                    </div>
                    <div className="mt-4 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xl font-bold tracking-tight text-white">
                        Win Rate
                      </h5>
                      <div className="p-2 bg-green-600 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="font-normal text-4xl text-gray-200 mb-2">
                      {stats.winRate}%
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm">
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
                    <div className="mt-4 flex">
                      <div
                        className="h-1 bg-green-500 rounded-l-full"
                        style={{
                          width: `${(stats.wins / stats.totalGames) * 100}%`,
                        }}
                      ></div>
                      <div
                        className="h-1 bg-red-500"
                        style={{
                          width: `${(stats.losses / stats.totalGames) * 100}%`,
                        }}
                      ></div>
                      <div
                        className="h-1 bg-yellow-500 rounded-r-full"
                        style={{
                          width: `${(stats.draws / stats.totalGames) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xl font-bold tracking-tight text-white">
                        Total Bet
                      </h5>
                      <div className="p-2 bg-purple-600 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="font-normal text-4xl text-gray-200 mb-2">
                      ${stats.totalBet}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Avg. Bet: $
                        {(stats.totalBet / stats.totalGames).toFixed(2)}
                      </span>
                      <div className="ml-auto">
                        {getTrendIndicator(-5, false)}
                      </div>
                    </div>
                    <div className="mt-4 p-1 bg-gray-700 rounded-lg">
                      <div
                        className="text-xs text-center text-white p-1 bg-purple-600 rounded"
                        style={{
                          width: `${Math.min(
                            100,
                            (stats.totalBet / 1000) * 100
                          )}%`,
                        }}
                      >
                        {Math.min(100, (stats.totalBet / 1000) * 100).toFixed(
                          0
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xl font-bold tracking-tight text-white">
                        Net Profit
                      </h5>
                      <div
                        className={`p-2 ${
                          stats.profit >= 0 ? "bg-green-600" : "bg-red-600"
                        } rounded-full`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p
                      className={`font-normal text-4xl ${
                        stats.profit >= 0 ? "text-green-500" : "text-red-500"
                      } mb-2`}
                    >
                      ${stats.profit}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        ROI:{" "}
                        {((stats.profit / stats.totalBet) * 100).toFixed(1)}%
                      </span>
                      <div className="ml-auto">
                        {getTrendIndicator(stats.profit > 0 ? 8 : -8)}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-2 ${
                            stats.profit >= 0 ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (Math.abs(stats.profit) / 100) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-400">
                        {Math.min(
                          100,
                          (Math.abs(stats.profit) / 100) * 100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {stats && stats.bestGame && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <div className="p-4 flex flex-col">
                    <h5 className="text-lg font-bold mb-2 text-white">
                      Current Streak
                    </h5>
                    <div className="flex items-center">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          stats.streakType === "win"
                            ? "bg-green-600"
                            : stats.streakType === "loss"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        <span className="text-white text-xl font-bold">
                          {stats.currentStreak}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg text-gray-200">
                          {stats.streakType === "win"
                            ? "Win"
                            : stats.streakType === "loss"
                            ? "Loss"
                            : "Draw"}{" "}
                          streak
                        </p>
                        <p className="text-sm text-gray-400">
                          Last {stats.currentStreak} games
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 flex flex-col">
                    <h5 className="text-lg font-bold mb-2 text-white">
                      Best Game
                    </h5>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg text-gray-200">
                          {stats.bestGame.game}
                        </p>
                        <p className="text-sm text-green-400">
                          +$
                          {stats.bestGame.winAmount - stats.bestGame.betAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4 flex flex-col">
                    <h5 className="text-lg font-bold mb-2 text-white">
                      Favorite Game
                    </h5>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        {games.length > 0 ? (
                          <>
                            <p className="text-lg text-gray-200">{games[0]}</p>
                            <p className="text-sm text-gray-400">
                              {
                                filteredHistory.filter(
                                  (item) => item.game === games[0]
                                ).length
                              }{" "}
                              plays
                            </p>
                          </>
                        ) : (
                          <p className="text-lg text-gray-200">
                            No games played
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-12 gap-6 mb-6">
              {/* Results Chart */}
              <Card className="col-span-4">
                <h5 className="text-xl font-bold mb-2 text-white p-4">
                  Results Distribution
                </h5>
                <div className="p-4 h-64 flex justify-center items-center">
                  {stats && <Chart type="pie" data={resultsChartData} />}
                </div>
              </Card>

              {/* Financial Chart */}
              <Card className="col-span-8">
                <h5 className="text-xl font-bold mb-2 text-white p-4">
                  Recent Bets & Wins
                </h5>
                <div className="p-4 h-64 flex justify-center items-center">
                  {filteredHistory.length > 0 && (
                    <Chart type="bar" data={financialChartData} />
                  )}
                </div>
              </Card>
            </div>

            {/* History Table */}
            <Card className="mb-6 overflow-x-auto">
              <h5 className="text-xl font-bold mb-2 text-white p-4">
                Game History
              </h5>
              <div className="overflow-x-auto">
                <Table striped>
                  <Table.Head>
                    <Table.HeadCell>Game</Table.HeadCell>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Bet Amount</Table.HeadCell>
                    <Table.HeadCell>Win Amount</Table.HeadCell>
                    <Table.HeadCell>Profit/Loss</Table.HeadCell>
                    <Table.HeadCell>Result</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item) => (
                        <Table.Row
                          key={item.id}
                          className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {item.game}
                          </Table.Cell>
                          <Table.Cell>{formatDate(item.date)}</Table.Cell>
                          <Table.Cell>{item.betAmount}</Table.Cell>
                          <Table.Cell>{item.winAmount}</Table.Cell>
                          <Table.Cell>
                            {getProfit(item.betAmount, item.winAmount)}
                          </Table.Cell>
                          <Table.Cell>
                            {getResultBadge(item.betAmount, item.winAmount)}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={6} className="text-center py-4">
                          No game history found
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default GameStatistics;
