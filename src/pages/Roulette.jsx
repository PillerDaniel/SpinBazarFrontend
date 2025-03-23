import Footer from '../components/ui/Footer';
import Navbar from '../components/ui/Navbar';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Roulette = () => {
  // Game states
  const [gameStatus, setGameStatus] = useState('idle'); // idle, spinning, result
  const [message, setMessage] = useState('Place your bets and press Spin to start');
  const [spinResult, setSpinResult] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  
  // Betting and money state
  const [balance, setBalance] = useState(1000);
  const [currentBets, setCurrentBets] = useState({});
  const [selectedChip, setSelectedChip] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [customBetAmount, setCustomBetAmount] = useState("");
  
  // Available chips
  const chips = [5, 25, 100, 500];
  
  // Roulette numbers with their properties
  const rouletteNumbers = [
    { number: 0, color: 'green' },
    { number: 32, color: 'red' },
    { number: 15, color: 'black' },
    { number: 19, color: 'red' },
    { number: 4, color: 'black' },
    { number: 21, color: 'red' },
    { number: 2, color: 'black' },
    { number: 25, color: 'red' },
    { number: 17, color: 'black' },
    { number: 34, color: 'red' },
    { number: 6, color: 'black' },
    { number: 27, color: 'red' },
    { number: 13, color: 'black' },
    { number: 36, color: 'red' },
    { number: 11, color: 'black' },
    { number: 30, color: 'red' },
    { number: 8, color: 'black' },
    { number: 23, color: 'red' },
    { number: 10, color: 'black' },
    { number: 5, color: 'red' },
    { number: 24, color: 'black' },
    { number: 16, color: 'red' },
    { number: 33, color: 'black' },
    { number: 1, color: 'red' },
    { number: 20, color: 'black' },
    { number: 14, color: 'red' },
    { number: 31, color: 'black' },
    { number: 9, color: 'red' },
    { number: 22, color: 'black' },
    { number: 18, color: 'red' },
    { number: 29, color: 'black' },
    { number: 7, color: 'red' },
    { number: 28, color: 'black' },
    { number: 12, color: 'red' },
    { number: 35, color: 'black' },
    { number: 3, color: 'red' },
    { number: 26, color: 'black' }
  ];
  
  // Available bet types
  const betTypes = [
    { id: 'straight', name: 'Straight (Single Number)', payout: 35, description: 'Choose any single number' },
    { id: 'red', name: 'Red', payout: 1, description: 'All red numbers' },
    { id: 'black', name: 'Black', payout: 1, description: 'All black numbers' },
    { id: 'even', name: 'Even', payout: 1, description: 'All even numbers (not 0)' },
    { id: 'odd', name: 'Odd', payout: 1, description: 'All odd numbers' },
    { id: 'low', name: 'Low (1-18)', payout: 1, description: 'Numbers 1 through 18' },
    { id: 'high', name: 'High (19-36)', payout: 1, description: 'Numbers 19 through 36' },
    { id: 'dozen1', name: '1st Dozen (1-12)', payout: 2, description: 'Numbers 1 through 12' },
    { id: 'dozen2', name: '2nd Dozen (13-24)', payout: 2, description: 'Numbers 13 through 24' },
    { id: 'dozen3', name: '3rd Dozen (25-36)', payout: 2, description: 'Numbers 25 through 36' },
    { id: 'column1', name: '1st Column', payout: 2, description: 'Numbers 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34' },
    { id: 'column2', name: '2nd Column', payout: 2, description: 'Numbers 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' },
    { id: 'column3', name: '3rd Column', payout: 2, description: 'Numbers 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' }
  ];
  
  // Handle chip selection
  const selectChip = (value) => {
    if (gameStatus !== 'idle') return;
    setSelectedChip(value);
    setCustomBetAmount("");
  };
  
  // Handle custom bet input
  const handleCustomBetChange = (e) => {
    if (gameStatus !== 'idle') return;
    
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomBetAmount(value);
      setSelectedChip(null);
    }
  };
  
  // Select bet type
  const selectBetType = (betType) => {
    if (gameStatus !== 'idle') return;
    setSelectedBet(betType);
  };
  
  // Place bet
  const placeBet = () => {
    if (gameStatus !== 'idle' || !selectedBet) return;
    
    let betAmount = 0;
    
    if (selectedChip) {
      betAmount = selectedChip;
    } else if (customBetAmount) {
      betAmount = parseInt(customBetAmount);
    }
    
    // Validate bet amount
    if (betAmount <= 0) {
      setMessage("Please select a chip or enter a valid amount");
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
    
    // For straight bets, we need a number
    if (selectedBet.id === 'straight') {
      const promptValue = prompt("Enter a number between 0 and 36:");
      if (promptValue === null) return; // User cancelled
      
      const number = parseInt(promptValue);
      if (isNaN(number) || number < 0 || number > 36) {
        setMessage("Please enter a valid number between 0 and 36");
        return;
      }
      
      // Add the bet
      const betKey = `${selectedBet.id}_${number}`;
      setCurrentBets(prev => ({
        ...prev,
        [betKey]: (prev[betKey] || 0) + betAmount
      }));
    } else {
      // Add the bet for other bet types
      setCurrentBets(prev => ({
        ...prev,
        [selectedBet.id]: (prev[selectedBet.id] || 0) + betAmount
      }));
    }
    
    setBalance(balance - betAmount);
    setCustomBetAmount("");
    setMessage(`Bet placed on ${selectedBet.name}! Place more bets or press Spin to start`);
  };
  
  // Clear bets
  const clearBets = () => {
    if (gameStatus !== 'idle') return;
    
    // Calculate total bet amount
    const totalBet = Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);
    
    // Return funds
    setBalance(balance + totalBet);
    setCurrentBets({});
    setMessage("Place your bets and press Spin to start");
  };
  
  // Spin the wheel
  const spinWheel = () => {
    if (Object.keys(currentBets).length === 0 || gameStatus !== 'idle') return;
    
    setGameStatus('spinning');
    setMessage("Spinning the wheel...");
    
    // Random number of rotations plus a random angle
    const spinRotations = 5 + Math.random() * 5; // Between 5 and 10 full rotations
    const targetNumber = Math.floor(Math.random() * 37); // 0-36
    
    // Calculate exact angle to land on target number
    const numberIndex = rouletteNumbers.findIndex(n => n.number === targetNumber);
    const segmentAngle = 360 / rouletteNumbers.length;
    const targetAngle = 360 * spinRotations + (numberIndex * segmentAngle);
    
    setRotationAngle(targetAngle);
    setSpinResult(targetNumber);
    
    // Set timeout to show result
    setTimeout(() => {
      determineWinnings(targetNumber);
    }, 5000); // 5 seconds after spin starts
  };
  
  // Determine winnings
  const determineWinnings = (result) => {
    const resultNumber = rouletteNumbers.find(n => n.number === result);
    let totalWin = 0;
    
    // Check each bet
    Object.entries(currentBets).forEach(([betKey, amount]) => {
      let isWin = false;
      let payout = 0;
      
      // Straight bet
      if (betKey.startsWith('straight_')) {
        const betNumber = parseInt(betKey.split('_')[1]);
        if (result === betNumber) {
          isWin = true;
          payout = amount * 36; // Original bet + 35:1 payout
        }
      }
      // Color bets
      else if (betKey === 'red' && resultNumber.color === 'red') {
        isWin = true;
        payout = amount * 2; // Original bet + 1:1 payout
      }
      else if (betKey === 'black' && resultNumber.color === 'black') {
        isWin = true;
        payout = amount * 2; // Original bet + 1:1 payout
      }
      // Even/Odd
      else if (betKey === 'even' && result !== 0 && result % 2 === 0) {
        isWin = true;
        payout = amount * 2; // Original bet + 1:1 payout
      }
      else if (betKey === 'odd' && result % 2 === 1) {
        isWin = true;
        payout = amount * 2; // Original bet + 1:1 payout
      }
      // Low/High
      else if (betKey === 'low' && result >= 1 && result <= 18) {
        isWin = true;
        payout = amount * 2; // Original bet + 1:1 payout
      }
      else if (betKey === 'high' && result >= 19 && result <= 36) {
        isWin = true;
        payout = amount * 2; // Original bet + 1:1 payout
      }
      // Dozens
      else if (betKey === 'dozen1' && result >= 1 && result <= 12) {
        isWin = true;
        payout = amount * 3; // Original bet + 2:1 payout
      }
      else if (betKey === 'dozen2' && result >= 13 && result <= 24) {
        isWin = true;
        payout = amount * 3; // Original bet + 2:1 payout
      }
      else if (betKey === 'dozen3' && result >= 25 && result <= 36) {
        isWin = true;
        payout = amount * 3; // Original bet + 2:1 payout
      }
      // Columns
      else if (betKey === 'column1' && result % 3 === 1) {
        isWin = true;
        payout = amount * 3; // Original bet + 2:1 payout
      }
      else if (betKey === 'column2' && result % 3 === 2) {
        isWin = true;
        payout = amount * 3; // Original bet + 2:1 payout
      }
      else if (betKey === 'column3' && result % 3 === 0 && result !== 0) {
        isWin = true;
        payout = amount * 3; // Original bet + 2:1 payout
      }
      
      totalWin += payout;
    });
    
    setWinAmount(totalWin);
    setBalance(balance + totalWin);
    
    if (totalWin > 0) {
      setMessage(`The ball landed on ${result} ${resultNumber.color}. You won $${totalWin.toFixed(2)}!`);
    } else {
      setMessage(`The ball landed on ${result} ${resultNumber.color}. Better luck next time!`);
    }
    
    setGameStatus('result');
  };
  
  // Reset game
  const resetGame = () => {
    setCurrentBets({});
    setSelectedBet(null);
    setSpinResult(null);
    setWinAmount(0);
    setGameStatus('idle');
    setMessage('Place your bets and press Spin to start');
  };
  
  // Chip component
  const Chip = ({ value, selected }) => {
    const colors = {
      5: 'bg-gradient-to-r from-red-500 to-red-600',
      25: 'bg-gradient-to-r from-blue-500 to-blue-600',
      100: 'bg-gradient-to-r from-green-500 to-green-600',
      500: 'bg-gradient-to-r from-purple-500 to-purple-600'
    };
    
    return (
      <div 
        className={`rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-white font-bold cursor-pointer transform transition-transform duration-300 hover:scale-110 ${colors[value]} ${selected ? 'ring-4 ring-yellow-400 scale-110' : ''}`}
        onClick={() => selectChip(value)}
      >
        ${value}
      </div>
    );
  };
  
  // BetOption component
  const BetOption = ({ bet, selected, onClick }) => {
    return (
      <div 
        className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${selected ? 'bg-indigo-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        onClick={onClick}
      >
        <div className="font-medium">{bet.name}</div>
        <div className="text-xs mt-1 opacity-80">{bet.payout}:1</div>
      </div>
    );
  };
  
  // Get status badge color based on game status
  const getStatusBadgeColor = () => {
    if (gameStatus === 'result' && winAmount > 0) {
      return 'bg-green-700 text-green-100';
    } else if (gameStatus === 'result' && winAmount === 0) {
      return 'bg-red-700 text-red-100';
    } else if (gameStatus === 'spinning') {
      return 'bg-yellow-700 text-yellow-100';
    }
    return 'bg-blue-700 text-blue-100';
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 mt-24">
        {/* Betting section (1/3) */}
        <div className="lg:w-1/3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 flex flex-col">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Your Funds</h3>
            <div className="text-3xl font-bold text-green-400 mb-4">${balance.toFixed(2)}</div>
            
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Current Bets</h3>
            <div className="text-lg font-bold text-yellow-400 mb-2">
              ${Object.values(currentBets).reduce((sum, bet) => sum + bet, 0).toFixed(2)}
            </div>
            
            {Object.keys(currentBets).length > 0 && (
              <div className="mt-3 space-y-1 text-sm text-gray-300">
                {Object.entries(currentBets).map(([betKey, amount]) => {
                  let betName = betKey;
                  
                  // Format straight bets nicely
                  if (betKey.startsWith('straight_')) {
                    const number = betKey.split('_')[1];
                    betName = `Number ${number}`;
                  } else {
                    // Find the bet type name
                    const betType = betTypes.find(b => b.id === betKey);
                    if (betType) betName = betType.name;
                  }
                  
                  return (
                    <div key={betKey} className="flex justify-between">
                      <span>{betName}</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Chips</h3>
            <div className="flex justify-center space-x-3 sm:space-x-4 mb-4">
              {chips.map(chip => (
                <Chip key={chip} value={chip} selected={selectedChip === chip} />
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Custom Bet</h3>
              <div className="flex items-center">
                <span className="text-gray-300 text-lg mr-2">$</span>
                <input
                  type="text"
                  value={customBetAmount}
                  onChange={handleCustomBetChange}
                  placeholder="Enter amount"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={gameStatus !== 'idle'}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Max bet: $500</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Select Bet Type</h3>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {betTypes.map(bet => (
                  <BetOption 
                    key={bet.id}
                    bet={bet}
                    selected={selectedBet?.id === bet.id}
                    onClick={() => selectBetType(bet)}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
              <button 
                onClick={placeBet}
                disabled={(!selectedChip && !customBetAmount) || !selectedBet || gameStatus !== 'idle'}
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${
                  (!selectedChip && !customBetAmount) || !selectedBet || gameStatus !== 'idle' 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Place Bet
              </button>
              
              <button 
                onClick={clearBets}
                disabled={Object.keys(currentBets).length === 0 || gameStatus !== 'idle'}
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${
                  Object.keys(currentBets).length === 0 || gameStatus !== 'idle'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Clear Bets
              </button>
            </div>
          </div>
          
          {gameStatus === 'result' && (
            <button 
              onClick={resetGame}
              className="mt-auto w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base font-medium rounded-lg shadow-md hover:shadow-lg transform transition duration-300 hover:-translate-y-1 focus:outline-none"
            >
              New Game
            </button>
          )}
        </div>
        
        {/* Game section (2/3) */}
        <div className="lg:w-2/3">
          <div className="backdrop-blur-sm bg-white/5 rounded-xl shadow-xl overflow-hidden p-6 sm:p-8 relative">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-100 tracking-wide">
              <span className="relative">
                Roulette
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></span>
              </span>
            </h1>
            
            <div className={`${getStatusBadgeColor()} text-base font-medium px-6 py-3 rounded-lg shadow-md text-center mb-8 transition-all duration-500 ${gameStatus === 'spinning' ? 'animate-pulse' : ''}`}>
              {message}
            </div>
            
            <div className="w-full max-w-md mx-auto mb-10 relative">
              {/* Roulette wheel */}
              <div className="w-full pb-[100%] relative">
                <div className="absolute inset-0 rounded-full bg-gray-800 border-8 border-gray-700 shadow-xl overflow-hidden">
                  {/* Rotating wheel */}
                  <motion.div 
                    className="absolute inset-0 origin-center"
                    style={{ 
                      backgroundImage: `conic-gradient(
                        green 0deg ${360/rouletteNumbers.length}deg, 
                        ${rouletteNumbers.slice(1).map((n, i) => 
                          `${n.color} ${(i+1)*(360/rouletteNumbers.length)}deg ${(i+2)*(360/rouletteNumbers.length)}deg`
                        ).join(', ')}
                      )`,
                      transform: `rotate(${rotationAngle}deg)`
                    }}
                    animate={{ rotate: rotationAngle }}
                    transition={{ 
                      duration: 5,
                      ease: [0.32, 0.72, 0.12, 0.92]
                    }}
                  >
                    {/* Number markers */}
                    {rouletteNumbers.map((n, i) => {
                      const angle = i * (360 / rouletteNumbers.length);
                      return (
                        <div 
                          key={n.number}
                          className="absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ 
                            top: '50%', 
                            left: '50%',
                            transform: `rotate(${-angle}deg) translateY(-10rem) rotate(${angle}deg)`,
                          }}
                        >
                          {n.number}
                        </div>
                      );
                    })}
                  </motion.div>
                  
                  {/* Center hub */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gray-900 border-4 border-gray-700 z-10"></div>
                  
                  {/* Ball */}
                  {gameStatus === 'spinning' || gameStatus === 'result' ? (
                    <motion.div 
                      className="absolute w-5 h-5 rounded-full bg-white z-20 shadow-md"
                      style={{ 
                        top: '50%',
                        left: '50%',
                      }}
                      animate={gameStatus === 'spinning' ? {
                        x: [0, 120, 100, 90, 0],
                        y: [0, 0, 0, 0, 0],
                        rotate: [0, 1080, 2160, 3240, 3600],
                      } : {
                        x: 0,
                        y: 0,
                      }}
                      transition={{
                        duration: gameStatus === 'spinning' ? 5 : 0.5,
                        ease: "easeInOut",
                      }}
                    />
                  ) : null}
                  
                  {/* Ball stopper pieces */}
                  {rouletteNumbers.map((n, i) => {
                    const angle = i * (360 / rouletteNumbers.length);
                    return (
                      <div 
                        key={`divider-${n.number}`}
                        className="absolute top-1/2 left-1/2 w-1 h-12 bg-gray-600 origin-bottom"
                        style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* Result display */}
              {spinResult !== null && gameStatus === 'result' && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 border-2 border-gray-700 rounded-full px-4 py-1 flex items-center space-x-2">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      spinResult === 0 ? 'bg-green-600' : rouletteNumbers.find(n => n.number === spinResult)?.color === 'red' ? 'bg-red-600' : 'bg-black'
                    }`}
                  >
                    {spinResult}
                  </div>
                  <span className="text-white font-medium">{spinResult === 0 ? 'Green' : rouletteNumbers.find(n => n.number === spinResult)?.color}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              {gameStatus === 'idle' ? (
                <button 
                  onClick={spinWheel}
                  disabled={Object.keys(currentBets).length === 0}
                  className={`px-8 py-3 text-white text-lg font-medium rounded-lg shadow-md transform transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    Object.keys(currentBets).length === 0
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:-translate-y-1 hover:shadow-lg focus:ring-blue-500'
                  }`}
                >
                  Spin
                </button>
              ) : null}
            </div>
            
            {/* Bet descriptions */}
            {selectedBet && (
              <div className="mt-8 text-center">
                <div className="text-gray-400 text-sm">{selectedBet.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Roulette;