import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../utils/axios";
import { WalletMinimal, Coins, Info } from "lucide-react";

const payoutTable = [
  { symbols: "7️⃣ 7️⃣ 7️⃣", multiplier: 10, description: "Jackpot!" },
  { symbols: "🔔 🔔 🔔", multiplier: 10, description: "Jackpot!" },
  { symbols: "🍇 🍇 🍇", multiplier: 10, description: "Jackpot!" },
  { symbols: "🍊 🍊 🍊", multiplier: 10, description: "Jackpot!" },
  { symbols: "🍋 🍋 🍋", multiplier: 10, description: "Jackpot!" },
  { symbols: "🍒 🍒 🍒", multiplier: 10, description: "Jackpot!" },
  { symbols: "Any Two Match", multiplier: 2, description: "Partial Match" },
];

const Slot = () => {
  const { user, updateWalletBalance } = useAuth();
  const userData = useUser();
  const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "7️⃣"];
  const NUM_REELS = 3;
  const SYMBOLS_PER_REEL = 12;
  const initialReels = useRef(
    Array.from({ length: NUM_REELS }, () =>
      Array.from(
        { length: SYMBOLS_PER_REEL },
        () => symbols[Math.floor(Math.random() * symbols.length)]
      )
    )
  );

  const [reels] = useState(initialReels.current);
  const [spinResults, setSpinResults] = useState(["", "", ""]);
  const [gameStatus, setGameStatus] = useState("idle");
  const [message, setMessage] = useState("Place your bet and spin to start");
  const [balance, setBalance] = useState(
    userData?.walletBalance || user?.walletBalance || 0
  );
  const [currentBet, setCurrentBet] = useState(0);
  const [customBetAmount, setCustomBetAmount] = useState("");
  const [selectedChip, setSelectedChip] = useState(null);
  const [isBettingActive, setIsBettingActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chips = [5, 25, 100, 500];
  const spinTimeout = useRef(null);
  const [winDetails, setWinDetails] = useState(null);
  const [showPayouts, setShowPayouts] = useState(false);

  useEffect(() => {
    if (userData && userData.walletBalance !== undefined) {
      setBalance(userData.walletBalance);
    }
  }, [userData]);

  useEffect(() => {
    return () => {
      if (spinTimeout.current) {
        clearTimeout(spinTimeout.current);
      }
    };
  }, []);

  const selectChip = (value) => {
    if (gameStatus !== "idle" || !isBettingActive || loading) return;
    setSelectedChip(value);
    setCustomBetAmount("");
  };

  const handleCustomBetChange = (e) => {
    if (gameStatus !== "idle" || !isBettingActive || loading) return;
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue <= 500) {
        setCustomBetAmount(value);
        setSelectedChip(null);
      } else if (value.length > customBetAmount.length) {
        setMessage("Maximum bet is $500");
      } else {
        setCustomBetAmount(value);
        setSelectedChip(null);
      }
    }
  };

  const placeBet = () => {
    if (gameStatus !== "idle" || loading) return;
    if (!isBettingActive) {
      setMessage("Bet already placed. Press Spin or Clear Bet.");
      return;
    }
    let betAmount = 0;
    if (selectedChip) betAmount = selectedChip;
    else if (customBetAmount) betAmount = parseInt(customBetAmount, 10) || 0;

    if (betAmount <= 0) {
      setMessage("Please select a chip or enter a valid bet amount.");
      return;
    }
    if (betAmount > 500) {
      setMessage("Maximum bet is $500");
      return;
    }
    if (betAmount > balance) {
      setMessage("Insufficient funds for this bet");
      return;
    }

    setCurrentBet(betAmount);
    setIsBettingActive(false);
    setMessage(`Bet of $${betAmount.toFixed(2)} placed. Press Spin!`);
    setError(null);
  };

  const clearBet = () => {
    if (gameStatus !== "idle" || loading) return;
    setCurrentBet(0);
    setIsBettingActive(true);
    setSelectedChip(null);
    setCustomBetAmount("");
    setMessage("Place your bet and press Spin to start");
    setError(null);
    setWinDetails(null);
  };

  const spinReels = async () => {
    if (currentBet <= 0) {
      setMessage("Please place a bet first!");
      return;
    }
    if (gameStatus !== "idle" || loading) return;

    setLoading(true);
    setGameStatus("spinning");
    setMessage("Spinning...");
    setError(null);
    setWinDetails(null);

    try {
      const response = await axiosInstance.post(
        "/bet/placebet",
        { betAmount: currentBet },
        { withCredentials: true }
      );

      if (response.data.wallet) {
        const newBalance = response.data.wallet.balance;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      } else {
        const newBalance = balance - currentBet;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      }

      if (spinTimeout.current) clearTimeout(spinTimeout.current);
      spinTimeout.current = setTimeout(async () => {
        const finalResults = Array.from({ length: NUM_REELS }, () => {
          return symbols[Math.floor(Math.random() * symbols.length)];
        });
        setSpinResults(finalResults);
        await determineWin(finalResults);
      }, 2500);
    } catch (err) {
      console.error("Error placing bet:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to place bet. Please try again.";
      setMessage(errorMessage);
      setError(errorMessage);
      setGameStatus("idle");
      setIsBettingActive(true);
      setCurrentBet(0);
      setLoading(false);
    }
  };

  const determineWin = useCallback(
    async (results) => {
      let winAmount = 0;
      let details = "";
      let winningSymbols = "";

      if (results[0] === results[1] && results[1] === results[2]) {
        winningSymbols = `${results[0]} ${results[1]} ${results[2]}`;
        const payout =
          payoutTable.find((p) => p.symbols === winningSymbols) ||
          payoutTable.find((p) => p.multiplier === 10);
        if (payout) {
          winAmount = currentBet * payout.multiplier;
          details = payout.description || "Jackpot!";
          setGameStatus("playerWin");
        }
      } else if (
        results[0] === results[1] ||
        results[0] === results[2] ||
        results[1] === results[2]
      ) {
        const payout = payoutTable.find((p) => p.symbols === "Any Two Match");
        if (payout) {
          winAmount = currentBet * payout.multiplier;
          details = payout.description;
          setGameStatus("playerWin");
        }
      } else {
        details = "No win this time.";
        winAmount = 0;
        setGameStatus("playerLose");
      }

      setMessage(
        details + (winAmount > 0 ? ` You won $${winAmount.toFixed(2)}!` : "")
      );
      if (winAmount > 0) {
        setWinDetails({ amount: winAmount, details: details });
      } else {
        setWinDetails(null);
      }

      try {
        if (winAmount > 0) {
          await processWin(winAmount);
        }
        await addGameHistory("Slots", currentBet, winAmount);
      } catch (err) {
        console.error("Error processing win or adding history:", err);
        setError(
          "An error occurred processing the result. Please check your balance or refresh."
        );
      } finally {
        setLoading(false);
      }
    },
    [currentBet, updateWalletBalance, balance]
  );

  const addGameHistory = async (game, betAmount, winAmount) => {
    try {
      await axiosInstance.post(
        "/history/addhistory",
        { game, betAmount, winAmount },
        { withCredentials: true }
      );
      console.log("Game history added successfully");
    } catch (err) {
      console.error("Error adding game history:", err);
    }
  };

  const processWin = async (winAmount) => {
    try {
      const response = await axiosInstance.post(
        "/bet/winbet",
        { winAmount: winAmount },
        { withCredentials: true }
      );
      if (response.data && response.data.walletBalance !== undefined) {
        const newBalance = response.data.walletBalance;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      } else {
        const newBalance = balance + winAmount;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      }
    } catch (err) {
      console.error("Error updating wallet balance after win:", err);
      setError(
        "Failed to update wallet balance after win. Please refresh or contact support."
      );
      throw err;
    }
  };

  const resetGame = () => {
    setSpinResults(["", "", ""]);
    setCurrentBet(0);
    setGameStatus("idle");
    setMessage("Place your bet and press Spin to start");
    setIsBettingActive(true);
    setSelectedChip(null);
    setCustomBetAmount("");
    setWinDetails(null);
    setError(null);
    setLoading(false);
    if (spinTimeout.current) {
      clearTimeout(spinTimeout.current);
    }
  };

  const Reel = memo(({ finalResult, index, spinning }) => {
    const reelSymbols = symbols;
    const [displaySymbol, setDisplaySymbol] = useState(reelSymbols[0]);
    const intervalRef = useRef(null);

    useEffect(() => {
      if (spinning) {
        intervalRef.current = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * symbols.length);
          setDisplaySymbol(symbols[randomIndex]);
        }, 75);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (finalResult) {
          setDisplaySymbol(finalResult);
        } else {
          setDisplaySymbol(symbols[Math.floor(Math.random() * symbols.length)]);
        }
      }
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [spinning, finalResult]);

    const spinAnimation = {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 0.1, repeat: Infinity },
    };
    const stopAnimation = { opacity: 1 };

    return (
      <div className="relative h-24 w-16 sm:h-28 sm:w-20 md:h-32 md:w-24 m-1 sm:m-2 rounded-lg shadow-lg bg-gray-100 flex items-center justify-center border-2 border-gray-300 overflow-hidden">
        <motion.div
          key={`${displaySymbol}-${index}`}
          initial={{ opacity: 0 }}
          animate={spinning ? spinAnimation : stopAnimation}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800"
        >
          {displaySymbol}
        </motion.div>
      </div>
    );
  });

  const Chip = ({ value, selected }) => {
    const colors = {
      5: "bg-gradient-to-br from-red-500 to-red-700 ring-red-300",
      25: "bg-gradient-to-br from-blue-500 to-blue-700 ring-blue-300",
      100: "bg-gradient-to-br from-green-500 to-green-700 ring-green-300",
      500: "bg-gradient-to-br from-purple-600 to-purple-800 ring-purple-400",
    };
    const isDisabled = !isBettingActive || gameStatus !== "idle" || loading;

    return (
      <button
        type="button"
        className={`relative rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-white font-bold shadow-md transform transition-all duration-200 ease-in-out border-2 border-black/20
            ${colors[value]}
            ${
              selected && !isDisabled
                ? "ring-4 ring-yellow-400 scale-110 shadow-lg"
                : "ring-2 ring-white/30"
            }
            ${
              isDisabled
                ? "opacity-50 cursor-not-allowed grayscale"
                : "hover:scale-105 hover:shadow-md"
            }
            `}
        onClick={() => selectChip(value)}
        disabled={isDisabled}
        aria-pressed={selected}
        aria-label={`Select ${value} chip`}
      >
        <span className="absolute inset-0 rounded-full shadow-inner bg-black/10"></span>
        <span className="relative text-xs sm:text-sm md:text-base font-semibold drop-shadow-sm">
          ${value}
        </span>
        <span className="absolute top-1 left-1 w-3 h-3 bg-white bg-opacity-40 rounded-full blur-sm"></span>
      </button>
    );
  };

  const getStatusBadgeColor = () => {
    if (loading) return "bg-gray-700 text-gray-200 animate-pulse";

    switch (gameStatus) {
      case "playerWin":
        return "bg-green-800 text-green-100 shadow-md";
      case "playerLose":
        return "bg-red-800 text-red-100 shadow-md";
      case "spinning":
        return "bg-yellow-800 text-yellow-100 shadow-md";
      case "idle":
        return isBettingActive
          ? "bg-blue-800 text-blue-100 shadow-md"
          : "bg-cyan-800 text-cyan-100 shadow-md";
      default:
        return "bg-gray-800 text-gray-200 shadow-md";
    }
  };

  return (
    <div className="min-h-screen slot-container text-gray-200">
      <Navbar />
      {error && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 max-w-md w-full z-50"
          role="alert"
        >
          <div className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-lg shadow-lg relative flex items-center justify-between">
            <div>
              <strong className="font-bold block">Error!</strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-200 hover:text-white transition"
            >
              <svg
                className="fill-current h-6 w-6"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {gameStatus === "playerWin" && winDetails && (
          <motion.div
            initial={{ opacity: 0, y: -0, x: "-0%" }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.3, type: "spring", stiffness: 120 },
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: 50,
              transition: { duration: 0.2, ease: "easeIn" },
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 p-6 sm:p-8 bg-gradient-to-b from-gray-800 to-black rounded-xl shadow-xl border border-gray-600 text-center"
            style={{ minWidth: "280px", maxWidth: "400px" }}
          >
            <motion.img
              src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
              alt="Winning"
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-yellow-400"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { delay: 0.5, type: "spring", stiffness: 150 },
              }}
            />
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2 drop-shadow">
              WINNER!
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-semibold mb-1">
              {winDetails.details}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md mb-6">
              You won
              <span className="text-yellow-300">
                ${winDetails.amount.toFixed(2)}
              </span>
              !
            </p>
            <button
              onClick={resetGame}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition duration-300 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 border border-black/30"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8 mt-16 md:mt-20 relative">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 sm:p-6 flex flex-col border border-gray-700">
            <div className="bg-black/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-inner border border-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300">
                  Betting Panel
                </h3>
                <button
                  onClick={() => setShowPayouts(!showPayouts)}
                  className="p-1 text-gray-400 hover:text-yellow-400 transition rounded-full hover:bg-white/10"
                  aria-label="Show Payout Information"
                >
                  <Info size={20} />
                </button>
              </div>
              <AnimatePresence>
                {showPayouts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4 bg-gray-900/50 rounded p-3 border border-gray-700"
                  >
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                      Payouts (Multiplier x Bet)
                    </h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {payoutTable.map((p, i) => (
                        <li key={i} className="flex justify-between">
                          <span className="flex items-center gap-1">
                            {p.symbols.split(" ").map((s, si) => (
                              <span key={si} className="text-base">
                                {s}
                              </span>
                            ))}
                            :
                          </span>
                          <span className="font-medium text-yellow-500">
                            {p.multiplier}x
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="text-center sm:text-left">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Current Bet
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 py-1.5 px-3 bg-gradient-to-r from-yellow-600 to-orange-700 rounded shadow min-w-[100px]">
                    <Coins className="text-yellow-200 w-4 h-4" />
                    <span className="text-lg font-bold text-white">
                      {currentBet.toFixed(2)}$
                    </span>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Balance
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-2 py-1.5 px-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded shadow min-w-[120px]">
                    <WalletMinimal className="text-green-200 w-4 h-4" />
                    <span className="text-lg font-bold text-white">
                      {balance.toFixed(2)}$
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4 sm:mb-6 flex-grow">
              <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-3 sm:mb-4 text-center">
                Select Your Bet
              </h3>
              <div className="flex justify-center flex-wrap gap-2 sm:gap-3 md:gap-4 mb-5">
                {chips.map((chip) => (
                  <Chip
                    key={chip}
                    value={chip}
                    selected={selectedChip === chip && isBettingActive}
                  />
                ))}
              </div>
              <div className="mt-4 sm:mt-6">
                <label
                  htmlFor="customBet"
                  className="text-sm font-medium text-gray-400 mb-1 block text-center"
                >
                  Or Enter Custom Amount
                </label>
                <div className="flex items-center max-w-xs mx-auto bg-gray-700 border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-yellow-500">
                  <span className="text-gray-400 text-lg pl-3 pr-1">$</span>
                  <input
                    id="customBet"
                    type="number"
                    value={customBetAmount}
                    onChange={handleCustomBetChange}
                    placeholder="e.g., 50"
                    min="1"
                    max="500"
                    step="1"
                    className={`flex-1 w-full bg-transparent py-2 pr-3 text-gray-100 focus:outline-none placeholder-gray-500 ${
                      !isBettingActive || loading || gameStatus !== "idle"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !isBettingActive || loading || gameStatus !== "idle"
                    }
                    aria-label="Custom bet amount"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Max bet: $500
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
                <button
                  onClick={placeBet}
                  disabled={
                    (!selectedChip && !customBetAmount) ||
                    (parseInt(customBetAmount || "0") <= 0 && !selectedChip) ||
                    gameStatus !== "idle" ||
                    !isBettingActive ||
                    loading
                  }
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold shadow-md transition duration-300 text-sm sm:text-base flex-1 border border-black/30 ${
                    (!selectedChip && !customBetAmount) ||
                    (parseInt(customBetAmount || "0") <= 0 && !selectedChip) ||
                    gameStatus !== "idle" ||
                    !isBettingActive ||
                    loading
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed grayscale"
                      : "bg-gradient-to-r from-green-600 to-teal-700 text-white hover:from-green-500 hover:to-teal-600 transform hover:scale-[1.03]"
                  }`}
                >
                  Place Bet
                </button>
                <button
                  onClick={clearBet}
                  disabled={
                    !isBettingActive ||
                    (currentBet <= 0 && !selectedChip && !customBetAmount) ||
                    gameStatus !== "idle" ||
                    loading
                  }
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold shadow-md transition duration-300 text-sm sm:text-base flex-1 border border-black/30 ${
                    !isBettingActive ||
                    (currentBet <= 0 && !selectedChip && !customBetAmount) ||
                    gameStatus !== "idle" ||
                    loading
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed grayscale"
                      : "bg-gradient-to-r from-red-600 to-pink-700 text-white hover:from-red-500 hover:to-pink-600 transform hover:scale-[1.03]"
                  }`}
                >
                  Clear Bet
                </button>
              </div>
            </div>
            <div className="mt-auto pt-4">
              {(gameStatus === "playerWin" || gameStatus === "playerLose") && (
                <button
                  onClick={resetGame}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed border border-black/30"
                  disabled={loading}
                >
                  New Game
                </button>
              )}
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="backdrop-blur-sm bg-black/40 rounded-xl shadow-xl overflow-hidden p-4 sm:p-6 md:p-8 relative border border-gray-700/50 min-h-[500px] flex flex-col">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-8 text-center text-gray-100 tracking-wide">
                Slots Game
              </h1>
              <div
                className={`text-base sm:text-lg font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md text-center mb-6 sm:mb-8 transition-colors duration-300 ${getStatusBadgeColor()}`}
              >
                {message}
              </div>
              <div className="flex flex-grow justify-center items-center mb-8 sm:mb-10 filter drop-shadow-md">
                {reels.map((_, index) => (
                  <Reel
                    key={`reel-${index}`}
                    finalResult={spinResults[index]}
                    index={index}
                    spinning={gameStatus === "spinning"}
                  />
                ))}
              </div>
              <div className="flex justify-center mt-auto pt-6 sm:pt-8">
                {gameStatus === "idle" &&
                  !isBettingActive &&
                  currentBet > 0 && (
                    <button
                      onClick={spinReels}
                      disabled={loading}
                      className={`px-8 py-4 sm:px-10 sm:py-5 text-white text-lg sm:text-xl font-bold rounded-full shadow-lg transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-70 relative overflow-hidden group border-2 border-black/30 ${
                        loading
                          ? "bg-gray-600 cursor-not-allowed grayscale"
                          : "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-800 hover:shadow-xl hover:scale-[1.03] focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                      }`}
                    >
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm rounded-full"></span>
                      <span className="relative z-10">
                        {loading ? "Spinning..." : "SPIN!"}
                      </span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Slot;
