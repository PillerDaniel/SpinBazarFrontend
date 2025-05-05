import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bomb, Gem, WalletMinimal, Coins } from "lucide-react";
import { useTranslation } from "react-i18next";

import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const Cell = ({ cellData, onClick, revealed }) => {
  const { id, isMine, isRevealed, isClickedMine } = cellData;

  let content = null;
  let bgColor = "bg-gray-600 hover:bg-gray-500";
  let textColor = "text-transparent";

  if (isRevealed || revealed) {
    if (isMine) {
      bgColor = isClickedMine ? "bg-red-700" : "bg-red-500";
      textColor = "text-white";
      content = <Bomb className="w-full h-full" />;
    } else {
      bgColor = "bg-green-500";
      textColor = "text-yellow-300";
      content = <Gem className="w-full h-full" />;
    }
  }

  return (
    <motion.div
      key={id}
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-colors duration-200 ${bgColor} ${textColor}`}
      onClick={onClick}
    >
      <AnimatePresence>
        {(isRevealed || revealed) && content && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center justify-center w-full h-full p-2 sm:p-3 md:p-4"
          >
            <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Mines = () => {
  const { user, updateWalletBalance, updateXp } = useAuth();
  const { t } = useTranslation();

  const [balance, setBalance] = useState(user?.walletBalance || 0);

  useEffect(() => {
    if (user?.walletBalance !== undefined) {
      setBalance(user.walletBalance);
    }
  }, [user?.walletBalance]);

  const [lastBetAmount, setLastBetAmount] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [customBetAmount, setCustomBetAmount] = useState("");
  const [selectedChip, setSelectedChip] = useState(null);
  const [numMines, setNumMines] = useState(3);
  const [maxMines] = useState(TOTAL_CELLS - 1);

  const [gridState, setGridState] = useState([]);
  const [mineLocations, setMineLocations] = useState(new Set());
  const [revealedSafeCount, setRevealedSafeCount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);

  const [gameStatus, setGameStatus] = useState("betting");
  const [message, setMessage] = useState(t("mines.initialMessage"));
  const [isBettingActive, setIsBettingActive] = useState(true);
  const [revealAll, setRevealAll] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chips = [5, 25, 100, 500];

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const initialGrid = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
      id: i,
      isMine: false,
      isRevealed: false,
      isClickedMine: false,
    }));
    setGridState(initialGrid);
    setMineLocations(new Set());
    setRevealedSafeCount(0);
    setCurrentMultiplier(1.0);
    setRevealAll(false);
  };

  const calculateMultiplier = useCallback((revealedCount, minesCount) => {
    if (revealedCount === 0) return 1.0;
    const safeCells = TOTAL_CELLS - minesCount;
    if (safeCells <= 0) return 1.0;
    let multiplier = 1.0;
    for (let i = 0; i < revealedCount; i++) {
      const remainingSafe = safeCells - i;
      if (remainingSafe <= 0) {
        console.error(
          "Error calculating multiplier: Not enough safe cells remaining."
        );
        return Math.max(1.0, multiplier);
      }
      multiplier *= (TOTAL_CELLS - i) / remainingSafe;
    }
    const houseEdge = 0.99;
    return Math.max(1.0, multiplier * houseEdge);
  }, []);

  const placeMines = (numberOfMines, gridSize) => {
    const mines = new Set();
    const totalCells = gridSize * gridSize;
    while (mines.size < numberOfMines && mines.size < totalCells) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      mines.add(randomIndex);
    }
    return mines;
  };

  const handleStartGame = async () => {
    setError(null);
    if (currentBet <= 0) {
      setMessage(t("mines.error.invalidBet"));
      return;
    }
    if (numMines < 1 || numMines >= TOTAL_CELLS) {
      setMessage(t("mines.error.invalidMineCount", { min: 1, max: maxMines }));
      return;
    }
    if (currentBet > balance) {
      setMessage(t("mines.error.insufficientFunds"));
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/bet/placebet",
        { betAmount: currentBet },
        { withCredentials: true }
      );

      const newBalance = response.data?.wallet?.balance ?? balance - currentBet;
      setBalance(newBalance);
      updateWalletBalance(newBalance);
      updateXp(response.data.userXp);

      setLastBetAmount(currentBet);

      initializeGrid();
      const newMineLocations = placeMines(numMines, GRID_SIZE);
      setMineLocations(newMineLocations);
      setGridState((prevGrid) =>
        prevGrid.map((cell) => ({
          ...cell,
          isMine: newMineLocations.has(cell.id),
        }))
      );

      setIsBettingActive(false);
      setGameStatus("playing");
      setMessage(t("mines.startGameSuccessMessage"));
      setRevealAll(false);
    } catch (err) {
      console.error("Error starting game:", err);
      setMessage(
        err.response?.data?.message || t("mines.error.startGameFailed")
      );
      setIsBettingActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (index) => {
    if (gameStatus !== "playing" || gridState[index].isRevealed || revealAll) {
      return;
    }

    const clickedCell = gridState[index];
    let newGridState;

    if (mineLocations.has(index)) {
      newGridState = gridState.map((cell) =>
        cell.id === index
          ? { ...cell, isRevealed: true, isClickedMine: true }
          : cell
      );
      setGridState(newGridState);
      handleGameOver(false);
    } else {
      newGridState = gridState.map((cell) =>
        cell.id === index ? { ...cell, isRevealed: true } : cell
      );
      setGridState(newGridState);

      const newRevealedCount = revealedSafeCount + 1;
      setRevealedSafeCount(newRevealedCount);

      const newMultiplier = calculateMultiplier(newRevealedCount, numMines);
      setCurrentMultiplier(newMultiplier);

      setMessage(
        t("mines.multiplierUpdate", { multiplier: newMultiplier.toFixed(2) })
      );

      const totalSafeCells = TOTAL_CELLS - numMines;
      if (newRevealedCount === totalSafeCells) {
        handleGameOver(true);
      }
    }
  };

  const handleCashOut = async () => {
    if (gameStatus !== "playing" || revealedSafeCount === 0 || loading) return;

    setLoading(true);
    setError(null);
    const winAmount = parseFloat((currentBet * currentMultiplier).toFixed(2));

    try {
      const response = await axiosInstance.post(
        "/bet/winbet",
        { winAmount: winAmount },
        { withCredentials: true }
      );

      const newBalance = response.data?.walletBalance ?? balance + winAmount;
      setBalance(newBalance);
      updateWalletBalance(newBalance);

      await addGameHistory("Mines", currentBet, winAmount);
      setGameStatus("cashed_out");
      setMessage(t("mines.cashoutSuccess", { amount: winAmount.toFixed(2) }));
      setRevealAll(true);
      setIsBettingActive(true);
    } catch (err) {
      console.error("Error cashing out:", err);
      setMessage(err.response?.data?.message || t("mines.error.cashoutFailed"));
      setError(t("mines.error.cashoutUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = async (isWin) => {
    setRevealAll(true);
    setIsBettingActive(true);

    let winAmount = 0;

    if (isWin) {
      setLoading(true);
      setError(null);
      const finalMultiplier = calculateMultiplier(
        TOTAL_CELLS - numMines,
        numMines
      );
      winAmount = parseFloat((currentBet * finalMultiplier).toFixed(2));
      setCurrentMultiplier(finalMultiplier);

      try {
        const response = await axiosInstance.post(
          "/bet/winbet",
          { winAmount },
          { withCredentials: true }
        );

        const newBalance = response.data?.walletBalance ?? balance + winAmount;
        setBalance(newBalance);
        updateWalletBalance(newBalance);

        await addGameHistory("Mines", currentBet, winAmount);
        setGameStatus("won");
        setMessage(t("mines.winMessage", { amount: winAmount.toFixed(2) }));
      } catch (err) {
        console.error("Error processing automatic win:", err);
        setMessage(
          err.response?.data?.message || t("mines.error.winProcessingFailed")
        );
        setError(t("mines.error.winUpdateFailed"));
      } finally {
        setLoading(false);
      }
    } else {
      setGameStatus("lost");
      setMessage(t("mines.gameOverLossMessage"));
      winAmount = 0;
      try {
        await addGameHistory("Mines", currentBet, winAmount);
      } catch (err) {
        console.error("Error adding game history for loss:", err);
      }
    }
  };

  const addGameHistory = async (game, betAmount, winAmount) => {
    try {
      await axiosInstance.post(
        "/history/addhistory",
        { game, betAmount, winAmount },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error adding game history:", err);
    }
  };

  const resetGame = () => {
    initializeGrid();
    if (lastBetAmount > 0 && lastBetAmount <= balance) {
      setCurrentBet(lastBetAmount);
      const matchingChip = chips.find((chip) => chip === lastBetAmount);
      if (matchingChip) {
        setSelectedChip(matchingChip);
        setCustomBetAmount("");
      } else {
        setSelectedChip(null);
        setCustomBetAmount(lastBetAmount.toString());
      }
      setMessage(
        t("mines.resetMessageWithBet", { amount: lastBetAmount.toFixed(2) })
      );
    } else {
      setCurrentBet(0);
      setSelectedChip(null);
      setCustomBetAmount("");
      setMessage(t("mines.initialMessage"));
      setLastBetAmount(0);
    }
    setGameStatus("betting");
    setIsBettingActive(true);
    setError(null);
    setCurrentMultiplier(1.0);
  };

  const selectChip = (value) => {
    if (!isBettingActive || loading) return;
    setSelectedChip(value);
    setCustomBetAmount("");
    setCurrentBet(value);
    setMessage(t("mines.betSetMessage", { amount: value }));
  };

  const handleCustomBetChange = (e) => {
    if (!isBettingActive || loading) return;
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const amount = value === "" ? 0 : parseInt(value, 10);
      setCustomBetAmount(value);
      setSelectedChip(null);

      if (amount >= 0) {
        const maxBet = 500;
        if (amount > maxBet) {
          setCurrentBet(0);
          setMessage(t("mines.error.maxBet", { amount: maxBet }));
        } else if (amount > balance) {
          setCurrentBet(0);
          setMessage(t("mines.error.insufficientFunds"));
        } else {
          setCurrentBet(amount);
          setMessage(t("mines.betSetMessage", { amount: amount }));
        }
      } else {
        setCurrentBet(0);
      }
    }
  };

  const handleNumMinesChange = (e) => {
    if (!isBettingActive || loading) return;
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const mines = value === "" ? 1 : parseInt(value, 10);
      if (mines < 1) {
        setMessage(t("mines.error.minMines", { min: 1 }));
      } else if (mines >= TOTAL_CELLS) {
        setMessage(t("mines.error.maxMines", { max: maxMines }));
        setNumMines(maxMines);
      } else {
        setNumMines(mines);
        setMessage(
          t("mines.minesSetMessage", {
            amount: currentBet.toFixed(2),
            mines: mines,
          })
        );
      }
    }
  };

  const clearBet = () => {
    if (!isBettingActive || loading) return;
    setCurrentBet(0);
    setSelectedChip(null);
    setCustomBetAmount("");
    setMessage(t("mines.initialMessage"));
  };

  const Chip = ({ value, selected }) => {
    const colors = {
      5: "bg-gradient-to-r from-red-500 to-red-600",
      25: "bg-gradient-to-r from-blue-500 to-blue-600",
      100: "bg-gradient-to-r from-green-500 to-green-600",
      500: "bg-gradient-to-r from-purple-500 to-purple-600",
    };

    return (
      <button
        className={`rounded-full w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center text-white font-bold cursor-pointer transform transition-all duration-300 hover:scale-110 ${
          colors[value]
        } ${
          selected && isBettingActive ? "ring-4 ring-yellow-400 scale-110" : ""
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 disabled:scale-100`}
        onClick={() => selectChip(value)}
        disabled={!isBettingActive || loading}
        aria-pressed={selected}
        aria-label={t("mines.selectChipLabel", { value })}
      >
        <span className="text-xs xs:text-xs sm:text-sm md:text-base">
          ${value}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen mb-20">
      <Navbar />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 mt-12 sm:mt-16 md:mt-20 lg:mt-24">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6">
          <div className="lg:w-1/3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col h-full">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200 mb-1 sm:mb-2">
                {t("mines.currentBet")}
              </h3>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-2 sm:mb-3 md:mb-4">
                <span className="relative inline-flex items-center space-x-1 sm:space-x-2 py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-2.5 md:px-3 bg-gradient-to-br from-yellow-300 to-orange-600 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
                  <Coins className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-100">
                    <b>${currentBet.toFixed(2)}</b>
                  </span>
                </span>
              </div>
              <div className="mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200 mb-1">
                  {t("mines.balance")}
                </h3>
                <div className="text-lg sm:text-xl md:text-2xl font-bold">
                  <span className="relative inline-flex items-center space-x-1 sm:space-x-2 py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-2.5 md:px-3 bg-gradient-to-br from-green-400 to-blue-600 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
                    <WalletMinimal className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-100">
                      <b>${balance.toFixed(2)}</b>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6 flex-grow">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200 mb-2 sm:mb-3">
                {t("mines.quickChips")}
              </h3>
              <div className="flex justify-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 mb-3 sm:mb-4">
                {chips.map((chip) => (
                  <Chip
                    key={chip}
                    value={chip}
                    selected={selectedChip === chip}
                  />
                ))}
              </div>

              <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200 mb-1">
                  {t("mines.customBet")}
                </h3>
                <div className="flex items-center">
                  <span className="text-gray-300 text-sm sm:text-base md:text-lg mr-1 sm:mr-2">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customBetAmount}
                    onChange={handleCustomBetChange}
                    placeholder={t("mines.enterAmountPlaceholder")}
                    className={`flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 text-sm sm:text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isBettingActive || loading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!isBettingActive || loading}
                    aria-label={t("mines.customBetAriaLabel")}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t("mines.maxBetInfo", { amount: 500 })}
                </p>
              </div>

              <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-200 mb-1">
                  {t("mines.numberOfMines")}
                </h3>
                <input
                  type="number"
                  min="1"
                  max={maxMines}
                  value={numMines}
                  onChange={handleNumMinesChange}
                  className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 text-sm sm:text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isBettingActive || loading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!isBettingActive || loading}
                  aria-label={t("mines.numberOfMinesAriaLabel")}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t("mines.minesRangeInfo", { min: 1, max: maxMines })}
                </p>
              </div>

              <div className="flex justify-center mt-3 sm:mt-4 md:mt-5 lg:mt-6">
                <button
                  onClick={clearBet}
                  disabled={currentBet <= 0 || !isBettingActive || loading}
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg font-medium shadow-md transition text-xs sm:text-sm md:text-base w-full ${
                    currentBet <= 0 || !isBettingActive || loading
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {t("mines.clearBetButton")}
                </button>
              </div>
            </div>

            <div className="mt-auto space-y-2 sm:space-y-3">
              {gameStatus === "betting" && (
                <button
                  onClick={handleStartGame}
                  disabled={
                    currentBet <= 0 ||
                    numMines < 1 ||
                    numMines >= TOTAL_CELLS ||
                    loading ||
                    currentBet > balance
                  }
                  className={`w-full px-3 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 text-white text-sm sm:text-base font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    currentBet <= 0 ||
                    numMines < 1 ||
                    numMines >= TOTAL_CELLS ||
                    loading ||
                    currentBet > balance
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:-translate-y-1 hover:shadow-lg focus:ring-blue-500"
                  }`}
                >
                  {loading ? t("mines.startingButton") : t("mines.startButton")}
                </button>
              )}

              {gameStatus === "playing" && (
                <button
                  onClick={handleCashOut}
                  disabled={revealedSafeCount === 0 || loading}
                  className={`w-full px-3 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 text-white text-sm sm:text-base font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    revealedSafeCount === 0 || loading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:-translate-y-1 hover:shadow-lg focus:ring-yellow-500"
                  }`}
                >
                  {loading
                    ? t("mines.cashingOutButton")
                    : t("mines.cashoutButton", {
                        multiplier: currentMultiplier.toFixed(2),
                      })}
                </button>
              )}

              {(gameStatus === "lost" ||
                gameStatus === "cashed_out" ||
                gameStatus === "won") && (
                <button
                  onClick={resetGame}
                  className="w-full px-3 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg transform transition duration-300 hover:-translate-y-1 focus:outline-none disabled:opacity-70"
                  disabled={loading}
                >
                  {t("mines.newGameButton")}
                </button>
              )}
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="backdrop-blur-sm bg-white/5 rounded-xl shadow-xl overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 relative h-full flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-center text-gray-100 tracking-wide">
                <span className="relative">
                  {t("mines.title")}
                  <span className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-purple-500 to-blue-500"></span>
                </span>
              </h1>

              <div
                className={`text-xs xs:text-sm sm:text-base font-medium px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg shadow-md text-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 transition-all duration-300
                            ${
                              gameStatus === "lost"
                                ? "bg-red-800 text-red-100"
                                : ""
                            }
                            ${
                              gameStatus === "won" ||
                              gameStatus === "cashed_out"
                                ? "bg-green-800 text-green-100"
                                : ""
                            }
                            ${
                              gameStatus === "playing"
                                ? "bg-blue-800 text-blue-100 animate-pulse"
                                : ""
                            }
                             ${
                               gameStatus === "betting"
                                 ? "bg-blue-800 text-gray-200 animate-pulse"
                                 : ""
                             }
                           `}
                role="status"
              >
                {message}
              </div>

              <div className="flex justify-center items-center flex-grow">
                <div
                  className={`grid grid-cols-5 gap-1.5 xs:gap-2 sm:gap-3 justify-center items-center mx-auto max-w-max ${
                    gameStatus !== "playing" && gameStatus !== "betting"
                      ? "opacity-75 cursor-not-allowed"
                      : ""
                  }`}
                  aria-label={t("mines.gridAriaLabel")}
                >
                  <AnimatePresence>
                    {gridState.map((cell) => (
                      <Cell
                        key={cell.id}
                        cellData={cell}
                        onClick={() => handleCellClick(cell.id)}
                        revealed={revealAll}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {gameStatus === "playing" && revealedSafeCount > 0 && (
                <div className="mt-4 sm:mt-6 text-center">
                  <span className="text-sm sm:text-base lg:text-lg font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-yellow-600 text-white">
                    {t("mines.currentMultiplierLabel", {
                      multiplier: currentMultiplier.toFixed(2),
                    })}
                  </span>
                </div>
              )}
              {error && (
                <div className="mt-4 text-center text-red-500 text-sm bg-red-100 border border-red-400 px-4 py-2 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Mines;
