import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bomb, Gem, WalletMinimal, Coins } from "lucide-react"; // Szükséges ikonok importálása

import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import axiosInstance from "../utils/axios";

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// --- Cell Komponens (lehet külön fájlban is) ---
const Cell = ({ cellData, onClick, revealed }) => {
  const { id, isMine, isRevealed, isClickedMine } = cellData;

  let content = null;
  let bgColor = "bg-gray-600 hover:bg-gray-500"; // Alap, rejtett cella
  let textColor = "text-transparent"; // Kezdetben ne látszódjon semmi

  if (isRevealed || revealed) {
    // Ha fel van fedve, vagy a játék végén felfedjük
    if (isMine) {
      bgColor = isClickedMine ? "bg-red-700" : "bg-red-500"; // Külön szín a rákattintott aknának
      textColor = "text-white";
      content = <Bomb size={24} />;
    } else {
      bgColor = "bg-green-500"; // Biztonságos cella
      textColor = "text-yellow-300";
      content = <Gem size={24} />; // Vagy Star, Diamond stb.
    }
  }

  return (
    <motion.div
      key={id}
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-colors duration-200 ${bgColor} ${textColor}`}
      onClick={onClick}
    >
      {/* Animáció a felfedéshez */}
      <AnimatePresence>
        {(isRevealed || revealed) && content && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
// --- Cell Komponens vége ---

const Mines = () => {
  const { user, updateWalletBalance } = useAuth();
  const userData = useUser();

  // --- State változók ---
  // State inicializálás
  const [balance, setBalance] = useState(
    userData?.walletBalance || user?.walletBalance || 0
  );

  // useEffect a frissítéshez
  useEffect(() => {
    if (userData && userData.walletBalance !== undefined) {
      setBalance(userData.walletBalance);
    }
    // Hozzáadhatjuk a user?.walletBalance ellenőrzést is a teljesség kedvéért
    else if (user && user.walletBalance !== undefined) {
      setBalance(user.walletBalance);
    }
  }, [userData, user]); // Vegyük fel a user-t is dependency-nek
  const [currentBet, setCurrentBet] = useState(0);
  const [customBetAmount, setCustomBetAmount] = useState("");
  const [selectedChip, setSelectedChip] = useState(null);
  const [numMines, setNumMines] = useState(3); // Alapértelmezett aknaszám
  const [maxMines, setMaxMines] = useState(TOTAL_CELLS - 1);

  const [gridState, setGridState] = useState([]);
  const [mineLocations, setMineLocations] = useState(new Set());
  const [revealedSafeCount, setRevealedSafeCount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);

  const [gameStatus, setGameStatus] = useState("betting"); // 'betting', 'playing', 'lost', 'cashed_out'
  const [message, setMessage] = useState(
    "Place your bet and select number of mines."
  );
  const [isBettingActive, setIsBettingActive] = useState(true);
  const [revealAll, setRevealAll] = useState(false); // Játék végén mindent felfedünk

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chips = [5, 25, 100, 500]; // Ugyanazok a chipek, mint Blackjacknél

  // --- useEffect Hookok ---
  useEffect(() => {
    // Balance frissítése kontextusból
    if (userData && userData.walletBalance !== undefined) {
      setBalance(userData.walletBalance);
    }
  }, [userData]);

  useEffect(() => {
    // Grid inicializálása betöltéskor (vagy amikor kell)
    initializeGrid();
  }, []);

  // --- Játék Logika Függvények ---

  const initializeGrid = () => {
    const initialGrid = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      initialGrid.push({
        id: i,
        isMine: false,
        isRevealed: false,
        isClickedMine: false, // Jelzi, ha pont erre az aknára kattintottak
      });
    }
    setGridState(initialGrid);
    setMineLocations(new Set());
    setRevealedSafeCount(0);
    setCurrentMultiplier(1.0);
    setRevealAll(false);
  };

  const calculateMultiplier = useCallback((revealedCount, minesCount) => {
    if (revealedCount === 0) return 1.0;

    const safeCells = TOTAL_CELLS - minesCount;
    let multiplier = 1.0;

    // Kombinációs képlet (pontosabb, mint a lépésenkénti szorzás)
    // Multiplier = C(TotalCells, revealedCount) / C(SafeCells, revealedCount)
    // De ez túl bonyolult lehet, használjunk egy egyszerűbb közelítést, ami a Stake-hez hasonló:
    // Prod( (TotalCells - i) / (SafeCells - i) ) for i = 0 to revealedCount - 1

    for (let i = 0; i < revealedCount; i++) {
      // Ellenőrzés, hogy ne osszunk nullával vagy negatívval
      if (safeCells - i <= 0) {
        // Elméletileg nem fordulhat elő, ha a logika jó
        console.error(
          "Error calculating multiplier: Division by zero or negative."
        );
        return multiplier; // Vagy valami hibaérték
      }
      multiplier *= (TOTAL_CELLS - i) / (safeCells - i);
    }

    // Hozzáadunk egy kis ház előnyt (pl. 1%)
    const houseEdge = 0.99;
    return Math.max(1.0, multiplier * houseEdge); // Legalább 1x legyen a szorzó
  }, []); // Dependencies: TOTAL_CELLS

  const placeMines = (numberOfMines, gridSize) => {
    const mines = new Set();
    const totalCells = gridSize * gridSize;
    while (mines.size < numberOfMines) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      mines.add(randomIndex);
    }
    return mines;
  };

  const handleStartGame = async () => {
    setError(null); // Hiba törlése új játék előtt
    if (currentBet <= 0) {
      setMessage("Please place a valid bet.");
      return;
    }
    if (numMines < 1 || numMines >= TOTAL_CELLS) {
      setMessage(`Number of mines must be between 1 and ${TOTAL_CELLS - 1}.`);
      return;
    }

    setLoading(true);
    try {
      // 1. Tét levonása a backendről
      const response = await axiosInstance.post(
        "/bet/placebet", // VAGY '/mines/start' endpoint, ha van külön
        { betAmount: currentBet /* , numMines: numMines */ }, // Küldheted a numMines-t is, ha a backend igényli
        { withCredentials: true }
      );

      // Sikeres tét levonás után
      if (response.data.wallet) {
        const newBalance = response.data.wallet.balance;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      } else {
        // Fallback, ha a backend nem küldi vissza expliciten
        const newBalance = balance - currentBet;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      }

      // 2. Játék inicializálása kliens oldalon
      initializeGrid(); // Tiszta rács
      const newMineLocations = placeMines(numMines, GRID_SIZE);
      setMineLocations(newMineLocations);

      // Grid state frissítése az aknákkal (de még nem felfedve)
      setGridState((prevGrid) =>
        prevGrid.map((cell) => ({
          ...cell,
          isMine: newMineLocations.has(cell.id),
        }))
      );

      setIsBettingActive(false);
      setGameStatus("playing");
      setMessage("Click on the tiles to find gems!");
      setRevealAll(false);
    } catch (err) {
      console.error("Error starting game:", err);
      setMessage(
        err.response?.data?.message || "Failed to start game. Bet not placed."
      );
      // Itt nem kell visszatenni a tétet, mert a backend hívás sikertelen volt
      setCurrentBet(0); // Töröljük a tétet, hogy újra próbálkozhasson
      setIsBettingActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (index) => {
    if (gameStatus !== "playing" || gridState[index].isRevealed || revealAll) {
      return; // Ne csináljon semmit, ha nem játszunk, vagy már fel van fedve
    }

    const clickedCell = gridState[index];

    if (mineLocations.has(index)) {
      // --- AKNA ---
      setGridState((prevGrid) =>
        prevGrid.map((cell) =>
          cell.id === index
            ? { ...cell, isRevealed: true, isClickedMine: true }
            : cell
        )
      );
      handleGameOver(false); // Vesztett
    } else {
      // --- BIZTONSÁGOS ---
      setGridState((prevGrid) =>
        prevGrid.map((cell) =>
          cell.id === index ? { ...cell, isRevealed: true } : cell
        )
      );

      const newRevealedCount = revealedSafeCount + 1;
      setRevealedSafeCount(newRevealedCount);

      const newMultiplier = calculateMultiplier(newRevealedCount, numMines);
      setCurrentMultiplier(newMultiplier);

      setMessage(`Multiplier: ${newMultiplier.toFixed(2)}x`);

      // Ellenőrizzük, hogy minden biztonságos mezőt felfedett-e
      const totalSafeCells = TOTAL_CELLS - numMines;
      if (newRevealedCount === totalSafeCells) {
        handleGameOver(true); // Nyert (automatikus)
      }
    }
  };

  const handleCashOut = async () => {
    if (gameStatus !== "playing" || revealedSafeCount === 0) return;

    setLoading(true);
    setError(null);
    const winAmount = parseFloat((currentBet * currentMultiplier).toFixed(2)); // Kerekítés 2 tizedesre

    try {
      // 1. Nyeremény jóváírása a backenddel
      const response = await axiosInstance.post(
        "/bet/winbet", // Vagy '/mines/finish'
        { winAmount: winAmount },
        { withCredentials: true }
      );

      // Balance frissítése
      if (response.data && response.data.walletBalance !== undefined) {
        const newBalance = response.data.walletBalance;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      } else {
        // Fallback
        const newBalance = balance + winAmount;
        setBalance(newBalance);
        updateWalletBalance(newBalance);
      }

      // 2. Játék előzmények rögzítése
      await addGameHistory("Mines", currentBet, winAmount);

      // 3. Játék állapot frissítése
      setGameStatus("cashed_out");
      setMessage(`Cashed out! You won $${winAmount.toFixed(2)}`);
      setRevealAll(true); // Felfedjük a többi mezőt
      setIsBettingActive(true); // Engedélyezzük az új tétet
    } catch (err) {
      console.error("Error cashing out:", err);
      setMessage(
        err.response?.data?.message ||
          "Failed to cash out. Please try again or refresh."
      );
      setError("Cash out failed. Wallet not updated.");
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = async (isWin) => {
    setRevealAll(true); 
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
        if (response.data && response.data.walletBalance !== undefined) {
          const newBalance = response.data.walletBalance;
          setBalance(newBalance);
          updateWalletBalance(newBalance);
        } else {
          const newBalance = balance + winAmount;
          setBalance(newBalance);
          updateWalletBalance(newBalance);
        }
        await addGameHistory("Mines", currentBet, winAmount);
        setGameStatus("won");
        setMessage(
          `Congratulations! You found all gems and won $${winAmount.toFixed(
            2
          )}!`
        );
      } catch (err) {
        console.error("Error processing automatic win:", err);
        setMessage(err.response?.data?.message || "Error processing win.");
        setError("Win processing failed. Wallet might not be updated.");
      } finally {
        setLoading(false);
        setIsBettingActive(true);
      }
    } else {
      setGameStatus("lost");
      setMessage("Boom! You hit a mine. Game Over.");
      winAmount = 0;
      try {
        await addGameHistory("Mines", currentBet, winAmount);
      } catch (err) {
        console.error("Error adding game history for loss:", err);
      }
      setIsBettingActive(true); 
    }
  };

  const addGameHistory = async (game, betAmount, winAmount) => {
    try {
      await axiosInstance.post(
        "/history/addhistory",
        { game, betAmount, winAmount },
        { withCredentials: true }
      );
      console.log("Game history added: Mines");
    } catch (err) {
      console.error("Error adding game history:", err);
    }
  };

  const resetGame = () => {
    initializeGrid();
    setCurrentBet(0);
    setCustomBetAmount("");
    setSelectedChip(null);
    setGameStatus("betting");
    setMessage("Place your bet and select number of mines.");
    setIsBettingActive(true);
    setError(null);
  };

  const selectChip = (value) => {
    if (!isBettingActive) return;
    setSelectedChip(value);
    setCustomBetAmount("");
    setCurrentBet(value); 
    setMessage(`Bet: $${value}. Select mines and press Start.`);
  };

  const handleCustomBetChange = (e) => {
    if (!isBettingActive) return;
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const amount = value === "" ? 0 : parseInt(value);
      setCustomBetAmount(value);
      setSelectedChip(null);
      if (amount >= 0) {
        if (amount > 500) {
          setCurrentBet(0); 
          setMessage("Maximum bet is $500");
        } else if (amount > balance) {
          setCurrentBet(0);
          setMessage("Insufficient funds for this bet.");
        } else {
          setCurrentBet(amount);
          setMessage(`Bet: $${amount}. Select mines and press Start.`);
        }
      }
    }
  };

  const handleNumMinesChange = (e) => {
    if (!isBettingActive) return;
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const mines = value === "" ? 0 : parseInt(value);
      if (mines < 0) return;
      if (mines >= TOTAL_CELLS) {
        setMessage(`Maximum mines allowed is ${TOTAL_CELLS - 1}.`);
        setNumMines(TOTAL_CELLS - 1);
      } else {
        setNumMines(mines);
        setMessage(`Bet: $${currentBet}. Mines: ${mines}. Press Start.`);
      }
    }
  };

  const clearBet = () => {
    if (!isBettingActive || gameStatus !== "betting") return;
    setCurrentBet(0);
    setSelectedChip(null);
    setCustomBetAmount("");
    setMessage("Place your bet and select number of mines.");
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
        className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center text-white font-bold cursor-pointer transform transition-all duration-300 hover:scale-110 ${
          colors[value]
        } ${
          selected && isBettingActive ? "ring-4 ring-yellow-400 scale-110" : "" 
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 disabled:scale-100`}
        onClick={() => selectChip(value)}
        disabled={!isBettingActive || loading} 
      >
        <span className="text-xs sm:text-sm md:text-base">${value}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-16 md:mt-24">
        {error && (
          <div
            className="mb-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              {/* Egyszerű 'X' a bezáráshoz */}
              <svg
                className="fill-current h-6 w-6 text-red-300 hover:text-red-100"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* --- Vezérlő Panel (Bal oldal) --- */}
          <div className="lg:w-1/3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-4 sm:p-6 flex flex-col">
            {/* Balance és Bet kijelzés */}
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1">
                  Balance
                </h3>
                <div className="text-xl sm:text-2xl font-bold">
                  <span className="relative inline-flex items-center space-x-2 py-2 px-3 bg-gradient-to-br from-green-600 to-blue-700 rounded-md text-gray-100">
                    <WalletMinimal className="w-6 h-6 sm:w-8 sm:h-8" />
                    <b>{balance.toFixed(2)}$</b>
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1">
                  Current Bet
                </h3>
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                  <span className="relative inline-flex items-center space-x-2 py-2 px-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-md text-gray-100">
                    <Coins className="w-6 h-6 sm:w-8 sm:h-8" />
                    <b>{currentBet.toFixed(2)}$</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Fogadási Beállítások */}
            <div className="mb-4 sm:mb-6">
              {/* Chipek */}
              <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3">
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

              {/* Custom Bet */}
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1">
                  Custom Bet
                </h3>
                <div className="flex items-center">
                  <span className="text-gray-300 text-base sm:text-lg mr-2">
                    $
                  </span>
                  <input
                    type="text" // text, hogy a pattern működjön
                    inputMode="numeric" // Mobilon numerikus billentyűzet
                    pattern="[0-9]*" // Csak számok engedélyezése
                    value={customBetAmount}
                    onChange={handleCustomBetChange}
                    placeholder="Enter amount"
                    className={`flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isBettingActive ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!isBettingActive || loading}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Max bet: $500</p>
              </div>

              {/* Aknák száma */}
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1">
                  Number of Mines
                </h3>
                <input
                  type="number"
                  min="1"
                  max={maxMines}
                  value={numMines}
                  onChange={handleNumMinesChange}
                  className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isBettingActive ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!isBettingActive || loading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Between 1 and {maxMines}
                </p>
              </div>

              {/* Tét törlése gomb */}
              <div className="flex justify-center mt-4 sm:mt-6">
                <button
                  onClick={clearBet}
                  disabled={currentBet <= 0 || !isBettingActive || loading}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium shadow-md transition text-sm sm:text-base w-full ${
                    // W-full, hogy kitöltse
                    currentBet <= 0 || !isBettingActive || loading
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Clear Bet
                </button>
              </div>
            </div>

            {/* Játékmenet Gombok */}
            <div className="mt-auto space-y-3">
              {gameStatus === "betting" && (
                <button
                  onClick={handleStartGame}
                  disabled={
                    currentBet <= 0 ||
                    numMines < 1 ||
                    numMines >= TOTAL_CELLS ||
                    loading
                  }
                  className={`w-full px-4 py-3 text-white text-base font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    currentBet <= 0 ||
                    numMines < 1 ||
                    numMines >= TOTAL_CELLS ||
                    loading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:-translate-y-1 hover:shadow-lg focus:ring-blue-500"
                  }`}
                >
                  Start Game
                </button>
              )}

              {gameStatus === "playing" && (
                <button
                  onClick={handleCashOut}
                  disabled={revealedSafeCount === 0 || loading}
                  className={`w-full px-4 py-3 text-white text-base font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    revealedSafeCount === 0 || loading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:-translate-y-1 hover:shadow-lg focus:ring-yellow-500"
                  }`}
                >
                  Cash Out ({currentMultiplier.toFixed(2)}x)
                </button>
              )}

              {(gameStatus === "lost" ||
                gameStatus === "cashed_out" ||
                gameStatus === "won") && (
                <button
                  onClick={resetGame}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base font-medium rounded-lg shadow-md hover:shadow-lg transform transition duration-300 hover:-translate-y-1 focus:outline-none"
                  disabled={loading}
                >
                  New Game
                </button>
              )}
            </div>
          </div>

          {/* --- Játék Rács (Jobb oldal) --- */}
          <div className="lg:w-2/3">
            <div className="backdrop-blur-sm bg-white/5 rounded-xl shadow-xl overflow-hidden p-4 sm:p-6 md:p-8 relative">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center text-gray-100 tracking-wide">
                <span className="relative">
                  Mines
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></span>
                </span>
              </h1>

              {/* Üzenet sáv */}
              <div
                className={`text-sm sm:text-base font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md text-center mb-4 sm:mb-6 transition-all duration-300
                  ${gameStatus === "lost" ? "bg-red-800 text-red-100" : ""}
                  ${
                    gameStatus === "won" || gameStatus === "cashed_out"
                      ? "bg-green-800 text-green-100"
                      : ""
                  }
                  ${
                    gameStatus === "playing" || gameStatus === "betting"
                      ? "bg-blue-800 text-blue-100 animate-pulse"
                      : ""
                  }
                `}
              >
                {message}
              </div>

              {/* A Rács */}
              <div
                className={`grid grid-cols-5 gap-2 sm:gap-3 justify-center mx-auto max-w-max ${
                  gameStatus !== "playing" ? "opacity-75" : ""
                }`}
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

              {/* Szorzó kijelzése játék közben */}
              {gameStatus === "playing" && revealedSafeCount > 0 && (
                <div className="mt-6 text-center">
                  <span className="text-lg font-semibold px-4 py-2 rounded-md bg-yellow-600 text-white">
                    Current Multiplier: {currentMultiplier.toFixed(2)}x
                  </span>
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
