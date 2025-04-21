import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../utils/axios";
import { WalletMinimal, Coins, X } from "lucide-react";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";

const Blackjack = () => {
  const { user, updateWalletBalance, updateXp } = useAuth();
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState("idle");
  const [message, setMessage] = useState(
    "Place your bet and press Deal to start"
  );

  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [currentBet, setCurrentBet] = useState(0);
  const [lastBetAmount, setLastBetAmount] = useState(0);
  const [customBetAmount, setCustomBetAmount] = useState("");
  const [selectedChip, setSelectedChip] = useState(null);
  const [isBettingActive, setIsBettingActive] = useState(true);
  const [standClicked, setStandClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chips = [5, 25, 100, 500];

  useEffect(() => {
    if (user && user.walletBalance !== undefined) {
      setBalance(user.walletBalance);
    }
  }, [user]);

  const createDeck = useCallback(() => {
    const suits = ["♥", "♦", "♠", "♣"];
    const values = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    const newDeck = [];
    for (let suit of suits) {
      for (let value of values) {
        newDeck.push({
          suit,
          value,
          numericValue: getCardValue(value),
          faceDown: false,
          id: `${suit}${value}-${Math.random().toString(16).slice(2)}`,
          isNew: false,
        });
      }
    }
    return shuffleDeck(newDeck);
  }, []);
  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const getCardValue = (value) => {
    if (["J", "Q", "K"].includes(value)) return 10;
    if (value === "A") return 11;
    return parseInt(value);
  };
  const calculateHandTotal = (hand) => {
    let total = hand.reduce(
      (sum, card) => sum + (card.faceDown ? 0 : card.numericValue),
      0
    );
    let aces = hand.filter(
      (card) => !card.faceDown && card.value === "A"
    ).length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  const selectChip = (value) => {
    if (gameStatus !== "idle" || !isBettingActive) return;
    setSelectedChip(value);
    setCustomBetAmount("");
  };
  const handleCustomBetChange = (e) => {
    if (gameStatus !== "idle" || !isBettingActive) return;
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomBetAmount(value);
      setSelectedChip(null);
    }
  };
  const placeBet = () => {
    if (gameStatus !== "idle" || !isBettingActive) return;
    let betAmount = 0;
    if (selectedChip) {
      betAmount = selectedChip;
    } else if (customBetAmount) {
      betAmount = parseInt(customBetAmount, 10) || 0;
    }
    if (betAmount <= 0) {
      setMessage("Select chip or enter valid amount.");
      return;
    }
    if (betAmount > 500) {
      setMessage("Max bet $500");
      return;
    }
    if (betAmount > balance) {
      setMessage("Insufficient funds");
      return;
    }
    setCurrentBet(betAmount);
    setIsBettingActive(false);
    setMessage(`Bet $${betAmount} placed. Press Deal.`);
  };
  const clearBet = () => {
    if (currentBet <= 0 || gameStatus !== "idle" || loading) return;
    setCurrentBet(0);
    setIsBettingActive(true);
    setSelectedChip(null);
    setCustomBetAmount("");
    setMessage("Place bet & press Deal.");
  };

  const dealGame = async () => {
    if (currentBet <= 0 || gameStatus !== "idle" || loading) return;
    setLastBetAmount(currentBet);
    setLoading(true);
    setError(null);
    let initialPlayerHand = [];
    let initialDealerHand = [];
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
        updateXp(response.data.userXp);
      } else {
        const newBalance = balance - currentBet;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
        updateXp(response.data.userXp);
      }
      const newDeck = createDeck();
      const pCard1 = { ...newDeck.pop(), isNew: true };
      const dCard1 = { ...newDeck.pop(), isNew: true };
      const pCard2 = { ...newDeck.pop(), isNew: true };
      const dCard2 = { ...newDeck.pop(), faceDown: true, isNew: true };
      initialPlayerHand = [pCard1, pCard2];
      initialDealerHand = [dCard1, dCard2];
      setDeck(newDeck);
      setPlayerHand(initialPlayerHand);
      setDealerHand(initialDealerHand);
      const playerTotal = calculateHandTotal(initialPlayerHand);
      if (playerTotal === 21) {
        // Blackjack Check
        const revealedDealerHand = initialDealerHand.map((card) => ({
          ...card,
          faceDown: false,
          isNew: card.faceDown,
        }));
        setDealerHand(revealedDealerHand);
        const dealerTotal = calculateHandTotal(revealedDealerHand);
        if (dealerTotal === 21) {
          setGameStatus("push");
          setMessage("Push! Both Blackjack!");
          await processWin(currentBet);
          await addGameHistory("Blackjack", currentBet, currentBet);
        } else {
          setGameStatus("playerWin");
          setMessage("Blackjack! You win!");
          const winAmount = currentBet * 2.5;
          await processWin(winAmount);
          await addGameHistory("Blackjack", currentBet, winAmount);
        }
      } else {
        setGameStatus("playing");
        setMessage("Your turn");
      }
    } catch (err) {
      console.error("Bet error:", err);
      setMessage(err.response?.data?.message || "Bet failed.");
      setCurrentBet(0);
      setLastBetAmount(0);
      setIsBettingActive(true);
      setError("Game start failed.");
      setPlayerHand([]);
      setDealerHand([]);
    } finally {
      setLoading(false);
    }
  };
  const hit = () => {
    if (gameStatus !== "playing" || loading) return;
    if (deck.length === 0) {
      setMessage("Deck empty!");
      return;
    }
    const newCard = { ...deck.pop(), isNew: true };
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck([...deck]);
    const total = calculateHandTotal(newHand);
    if (total > 21) {
      setGameStatus("playerBust");
      setMessage("Bust! You lose.");
      revealDealerCard();
      addGameHistory("Blackjack", currentBet, 0);
    }
  };

  const stand = () => {
    if (gameStatus !== "playing" || loading || standClicked) return;
    setStandClicked(true);
    dealerPlay();
  };

  const revealDealerCard = () => {
    setDealerHand((prevHand) =>
      prevHand.map((card) => ({
        ...card,
        faceDown: false,
        isNew: card.faceDown,
      }))
    );
  };
  const dealerPlay = () => {
    const revealedHand = dealerHand.map((card) => ({
      ...card,
      faceDown: false,
      isNew: card.faceDown,
    }));
    setDealerHand(revealedHand);
    let currentDeck = [...deck];
    const drawSequence = (handAfterReveal) => {
      let currentHand = handAfterReveal;
      let dealerTotal = calculateHandTotal(currentHand);
      const drawNext = () => {
        if (dealerTotal < 17) {
          if (currentDeck.length === 0) {
            console.error("Deck empty");
            determineWinner(currentHand);
            return;
          }
          const newCard = { ...currentDeck.pop(), isNew: true };
          const nextHand = [...currentHand, newCard];
          dealerTotal = calculateHandTotal(nextHand);
          setDealerHand(nextHand);
          setDeck(currentDeck);
          currentHand = nextHand;
          setTimeout(drawNext, 800);
        } else {
          setTimeout(() => determineWinner(currentHand), 600);
        }
      };
      setTimeout(drawNext, 800);
    };
    drawSequence(revealedHand);
  };
  const addGameHistory = async (game, betAmount, winAmount) => {
    if (betAmount <= 0) return;
    try {
      await axiosInstance.post(
        "/history/addhistory",
        { game, betAmount, winAmount },
        { withCredentials: true }
      );
      console.log("History added.");
    } catch (err) {
      console.error("History error:", err);
    }
  };
  const processWin = async (winAmount) => {
    if (winAmount <= 0) return;
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/bet/winbet",
        { winAmount },
        { withCredentials: true }
      );
      if (response.data && response.data.walletBalance !== undefined) {
        const newBalance = response.data.walletBalance;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
        up;
      } else {
        console.warn("Win processed, no new balance.");
        const finalBalance = balance - currentBet + winAmount;
        setBalance(finalBalance);
        updateWalletBalance(finalBalance);
      }
    } catch (err) {
      console.error("Win process error:", err);
      setError("Balance update failed.");
    } finally {
      setLoading(false);
    }
  };
  const determineWinner = async (finalDealerHand) => {
    const playerTotal = calculateHandTotal(playerHand);
    const dealerTotal = calculateHandTotal(finalDealerHand);
    let winAmount = 0;
    let outcomeStatus = "";
    let outcomeMessage = "";
    if (dealerTotal > 21) {
      outcomeStatus = "dealerBust";
      outcomeMessage = "Dealer busts! Win!";
      winAmount = currentBet * 2;
    } else if (dealerTotal > playerTotal) {
      outcomeStatus = "dealerWin";
      outcomeMessage = "Dealer wins.";
      winAmount = 0;
    } else if (playerTotal > dealerTotal) {
      if (playerTotal <= 21) {
        outcomeStatus = "playerWin";
        outcomeMessage = "You win!";
        winAmount = currentBet * 2;
      }
    } else {
      outcomeStatus = "push";
      outcomeMessage = "Push (Tie)";
      winAmount = currentBet;
    }
    setGameStatus(outcomeStatus);
    setMessage(outcomeMessage);
    try {
      setLoading(true);
      if (winAmount > 0) {
        await processWin(winAmount);
        await addGameHistory("Blackjack", currentBet, winAmount);
      } else {
        await addGameHistory("Blackjack", currentBet, 0);
      }
    } catch (err) {
      console.error("Final processing error:", err);
      setError("Error finalizing game.");
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setError(null);
    setLoading(false);
    setGameStatus("idle");
    setStandClicked(false);
    if (lastBetAmount > 0 && lastBetAmount <= balance) {
      setCurrentBet(lastBetAmount);
      setIsBettingActive(false);
      setMessage(`Bet $${lastBetAmount} placed. Press Deal.`);
      if (chips.includes(lastBetAmount)) {
        setSelectedChip(lastBetAmount);
        setCustomBetAmount("");
      } else {
        setSelectedChip(null);
        setCustomBetAmount(lastBetAmount.toString());
      }
    } else {
      setCurrentBet(0);
      setIsBettingActive(true);
      setMessage("Place bet & press Deal.");
      setSelectedChip(null);
      setCustomBetAmount("");
    }
  };

  useEffect(() => {
    if (playerHand.some((card) => card.isNew)) {
      const timer = setTimeout(() => {
        setPlayerHand((prev) =>
          prev.map((card) => ({ ...card, isNew: false }))
        );
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [playerHand]);
  useEffect(() => {
    if (dealerHand.some((card) => card.isNew)) {
      const timer = setTimeout(() => {
        setDealerHand((prev) =>
          prev.map((card) => ({ ...card, isNew: false }))
        );
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [dealerHand]);

  const Card = ({ card, index }) => {
    if (card.faceDown) {
      return (
        <div className="relative h-24 w-16 sm:h-28 sm:w-20 md:h-32 md:w-24 m-1 sm:m-2 rounded-lg shadow-lg bg-gray-700 flex items-center justify-center border-2 border-gray-600">
          <div className="text-xl sm:text-2xl text-gray-400 font-bold">?</div>
        </div>
      );
    }
    const color = ["♥", "♦"].includes(card.suit)
      ? "text-red-600"
      : "text-gray-800";
    const isAce = card.value === "A";
    const isFace = ["J", "Q", "K"].includes(card.value);
    const cardBaseClasses =
      "relative h-24 w-16 sm:h-28 sm:w-20 md:h-32 md:w-24 m-1 sm:m-2 rounded-lg shadow-lg bg-white flex flex-col items-center justify-between p-2 hover:shadow-xl border border-gray-300";
    if (card.isNew) {
      return (
        <motion.div
          key={card.id || index}
          initial={{ rotateY: 90, x: 100, opacity: 0 }}
          animate={{ rotateY: 0, x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={cardBaseClasses}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className={`self-start text-xs sm:text-sm font-bold ${color}`}>
            {card.value}
          </div>
          <div
            className={`text-xl sm:text-2xl md:text-3xl ${color} ${
              isAce || isFace ? "font-bold" : ""
            }`}
          >
            {card.suit}
          </div>
          <div className={`self-end text-xs sm:text-sm font-bold ${color}`}>
            {card.value}
          </div>
        </motion.div>
      );
    }
    return (
      <div key={card.id || index} className={cardBaseClasses}>
        <div className={`self-start text-xs sm:text-sm font-bold ${color}`}>
          {card.value}
        </div>
        <div
          className={`text-xl sm:text-2xl md:text-3xl ${color} ${
            isAce || isFace ? "font-bold" : ""
          }`}
        >
          {card.suit}
        </div>
        <div className={`self-end text-xs sm:text-sm font-bold ${color}`}>
          {card.value}
        </div>
      </div>
    );
  };

  const Chip = ({ value, selected }) => {
    const colors = {
      5: "bg-gradient-to-r from-red-500 to-red-600",
      25: "bg-gradient-to-r from-blue-500 to-blue-600",
      100: "bg-gradient-to-r from-green-500 to-green-600",
      500: "bg-gradient-to-r from-purple-500 to-purple-600",
    };

    return (
      <div
        className={`
          rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16
          flex items-center justify-center
          text-white font-bold transform transition-all duration-300
          ${colors[value]}
          ${
            selected ? "ring-4 ring-yellow-400 scale-105 shadow-lg" : ""
          } {/* Kiválasztás stílus MINDIG, ha selected=true */}
          ${
            isBettingActive
              ? "cursor-pointer hover:scale-110"
              : "opacity-75 cursor-not-allowed"
          }
        `}
        onClick={() => isBettingActive && selectChip(value)}
        role="button"
        aria-pressed={selected}
        aria-label={`Select $${value} chip`}
      >
        <span className="text-xs sm:text-sm md:text-base">${value}</span>
      </div>
    );
  };

  // Segédfüggvények a badge színekhez
  const getStatusBadgeColor = () => {
    if (gameStatus === "playerWin" || gameStatus === "dealerBust")
      return "bg-green-800 text-green-100";
    if (gameStatus === "dealerWin" || gameStatus === "playerBust")
      return "bg-red-800 text-red-100";
    if (gameStatus === "push") return "bg-yellow-800 text-yellow-100";
    return "bg-blue-800 text-blue-100";
  };
  const getTotalBadgeColor = (total) => {
    if (total > 21) return "bg-red-900 text-red-100";
    if (total === 21) return "bg-green-900 text-green-100";
    return "bg-gray-700 text-gray-100";
  };

  // JSX Struktúra
  return (
    <div className="min-h-screen mb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16 md:mt-24">
        {error && (
          <div
            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vezérlő Panel */}
          <div className="lg:w-1/3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 sm:p-6 flex flex-col">
            {/* Balance és Bet */}
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1 sm:mb-2">
                Current Bet
              </h3>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2 sm:mb-4">
                <span className="relative inline-flex items-center space-x-2 py-2.5 px-3 bg-gradient-to-br from-yellow-300 to-orange-600 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
                  <Coins className="text-white w-8 h-8" />
                  <span className="text-lg font-semibold text-gray-100">
                    <b>{currentBet.toFixed(2)}$</b>
                  </span>
                </span>
              </div>
              <div className="text-base sm:text-lg font-semibold text-gray-200 mb-1">
                Balance
              </div>
              <div className="text-xl sm:text-2xl font-bold">
                <span className="relative inline-flex items-center space-x-2 py-2.5 px-3 bg-gradient-to-br from-green-400 to-blue-600 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
                  <WalletMinimal className="text-white w-8 h-8" />
                  <span className="text-lg font-semibold text-gray-100">
                    <b>{balance.toFixed(2)}$</b>
                  </span>
                </span>
              </div>
            </div>
            {/* Quick Chips & Custom Bet */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4">
                Quick Chips
              </h3>
              <div className="flex justify-center space-x-2 sm:space-x-3 md:space-x-4 mb-4">
                {chips.map((chip) => (
                  <Chip
                    key={chip}
                    value={chip}
                    selected={selectedChip === chip}
                  />
                ))}
              </div>
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1 sm:mb-2">
                  Custom Bet
                </h3>
                <div className="flex items-center">
                  <span className="text-gray-300 text-base sm:text-lg mr-2">
                    $
                  </span>
                  <input
                    type="text"
                    pattern="\d*"
                    inputMode="decimal"
                    value={customBetAmount}
                    onChange={handleCustomBetChange}
                    placeholder="Enter amount"
                    className={`flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isBettingActive ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!isBettingActive}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Max bet: $500</p>
              </div>
              <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                <button
                  onClick={placeBet}
                  disabled={
                    (!selectedChip && !parseInt(customBetAmount, 10) > 0) ||
                    !isBettingActive ||
                    loading
                  }
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium shadow-md transition text-sm sm:text-base ${
                    (!selectedChip && !parseInt(customBetAmount, 10) > 0) ||
                    !isBettingActive ||
                    loading
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Place Bet
                </button>
                <button
                  onClick={clearBet}
                  disabled={currentBet <= 0 || gameStatus !== "idle" || loading}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium shadow-md transition text-sm sm:text-base ${
                    currentBet <= 0 || gameStatus !== "idle" || loading
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Clear Bet
                </button>
              </div>
            </div>
            {/* New Game Button */}
            <div className="mt-auto">
              {gameStatus !== "idle" && gameStatus !== "playing" && (
                <button
                  onClick={resetGame}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg transform transition duration-300 hover:-translate-y-1 focus:outline-none"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "New Game"}
                </button>
              )}
            </div>
          </div>
          {/* Játékterület */}
          <div className="lg:w-2/3">
            <div className="backdrop-blur-sm bg-white/5 rounded-xl shadow-xl overflow-hidden p-4 sm:p-6 md:p-8 relative">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center text-gray-100 tracking-wide">
                <span className="relative">
                  BLACKJACK
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></span>
                </span>
              </h1>
              <div
                className={`${getStatusBadgeColor()} text-sm sm:text-base font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md text-center mb-4 sm:mb-6 transition-all duration-500 ${
                  gameStatus !== "idle" && gameStatus !== "playing"
                    ? ""
                    : "animate-pulse"
                }`}
              >
                {loading && gameStatus !== "idle" ? "Processing..." : message}
              </div>
              {/* Dealer Hand */}
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-200">
                    Dealer
                  </h3>
                  {dealerHand.some((card) => !card.faceDown) &&
                    calculateHandTotal(dealerHand) > 0 && (
                      <span
                        className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium ${getTotalBadgeColor(
                          calculateHandTotal(dealerHand)
                        )}`}
                      >
                        Total: {calculateHandTotal(dealerHand)}
                      </span>
                    )}
                </div>
                <div className="flex flex-wrap justify-center min-h-32">
                  <AnimatePresence initial={false}>
                    {dealerHand.map((card, index) => (
                      <Card key={card.id || index} card={card} index={index} />
                    ))}
                  </AnimatePresence>
                  {dealerHand.length === 0 && gameStatus === "idle" && (
                    <div className="flex items-center justify-center w-full h-full text-gray-500 italic">
                      Dealer hand
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full border-t border-gray-700 my-3 sm:my-4"></div>
              {/* Player Hand */}
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-200">
                    Player
                  </h3>
                  {calculateHandTotal(playerHand) > 0 && (
                    <span
                      className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium ${getTotalBadgeColor(
                        calculateHandTotal(playerHand)
                      )}`}
                    >
                      Total: {calculateHandTotal(playerHand)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center min-h-32">
                  <AnimatePresence initial={false}>
                    {playerHand.map((card, index) => (
                      <Card key={card.id || index} card={card} index={index} />
                    ))}
                  </AnimatePresence>
                  {playerHand.length === 0 && gameStatus === "idle" && (
                    <div className="flex items-center justify-center w-full h-full text-gray-500 italic">
                      Player hand
                    </div>
                  )}
                </div>
              </div>
              {/* Játék Gombok */}
              <div className="flex justify-center space-x-3 sm:space-x-4 mt-4 sm:mt-6">
                {gameStatus === "idle" ? (
                  <button
                    onClick={dealGame}
                    disabled={currentBet <= 0 || loading}
                    className={`px-4 py-2 sm:px-6 sm:py-3 text-white text-sm sm:text-base font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      currentBet <= 0 || loading
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:-translate-y-1 hover:shadow-lg focus:ring-blue-500"
                    }`}
                  >
                    {loading ? "Dealing..." : "Deal"}
                  </button>
                ) : gameStatus === "playing" ? (
                  <>
                    <button
                      onClick={hit}
                      disabled={loading}
                      className={`px-4 py-2 sm:px-6 sm:py-3 text-white text-sm sm:text-base font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                        loading
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-teal-600 hover:-translate-y-1 hover:shadow-lg focus:ring-green-500"
                      }`}
                    >
                      Hit
                    </button>
                    <button
                      onClick={stand}
                      disabled={loading || standClicked}
                      className={`px-4 py-2 sm:px-6 sm:py-3 text-white text-sm sm:text-base font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                        loading || standClicked
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 to-pink-600 hover:-translate-y-1 hover:shadow-lg focus:ring-red-500"
                      }`}
                    >
                      Stand
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blackjack;
