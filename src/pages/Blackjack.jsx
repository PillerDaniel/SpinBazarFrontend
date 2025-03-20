import Footer from '../components/ui/Footer';
import Navbar from '../components/ui/Navbar';
import React, { useState } from 'react';

const Blackjack = () => {
  // Game state
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, playerBust, dealerBust, playerWin, dealerWin, push
  const [message, setMessage] = useState('Press Deal to start');

  // Create and shuffle a new deck
  const createDeck = () => {
    const suits = ['♥', '♦', '♠', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck = [];

    for (let suit of suits) {
      for (let value of values) {
        newDeck.push({
          suit,
          value,
          numericValue: getCardValue(value),
          faceDown: false
        });
      }
    }

    // Shuffle the deck
    return shuffleDeck(newDeck);
  };

  // Shuffle deck using Fisher-Yates algorithm
  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get card value
  const getCardValue = (value) => {
    if (['J', 'Q', 'K'].includes(value)) return 10;
    if (value === 'A') return 11;
    return parseInt(value);
  };

  // Calculate hand total, accounting for Aces
  const calculateHandTotal = (hand) => {
    let total = hand.reduce((sum, card) => sum + (card.faceDown ? 0 : card.numericValue), 0);
    let aces = hand.filter(card => !card.faceDown && card.value === 'A').length;
    
    // Adjust for Aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    
    return total;
  };

  // Deal a new game
  const dealGame = () => {
    const newDeck = createDeck();
    const pHand = [newDeck.pop(), newDeck.pop()];
    const dHand = [newDeck.pop(), { ...newDeck.pop(), faceDown: true }];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameStatus('playing');
    setMessage('Your turn');
  };

  // Player hits
  const hit = () => {
    if (gameStatus !== 'playing') return;
    
    const newHand = [...playerHand, deck.pop()];
    setPlayerHand(newHand);
    setDeck([...deck]);
    
    const total = calculateHandTotal(newHand);
    if (total > 21) {
      setGameStatus('playerBust');
      setMessage('Bust! You lose');
      revealDealerCard();
    }
  };

  // Player stands, dealer plays
  const stand = () => {
    if (gameStatus !== 'playing') return;
    
    dealerPlay();
  };

  // Reveal dealer's face down card
  const revealDealerCard = () => {
    const newDealerHand = dealerHand.map(card => ({ ...card, faceDown: false }));
    setDealerHand(newDealerHand);
  };

  // Dealer's turn to play
  const dealerPlay = () => {
    revealDealerCard();
    
    let newDealerHand = dealerHand.map(card => ({ ...card, faceDown: false }));
    let newDeck = [...deck];
    
    // Dealer hits until 17 or higher
    while (calculateHandTotal(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }
    
    setDealerHand(newDealerHand);
    setDeck(newDeck);
    
    determineWinner(newDealerHand);
  };

  // Determine the winner
  const determineWinner = (finalDealerHand) => {
    const playerTotal = calculateHandTotal(playerHand);
    const dealerTotal = calculateHandTotal(finalDealerHand);
    
    if (dealerTotal > 21) {
      setGameStatus('dealerBust');
      setMessage('Dealer busts! You win');
    } else if (dealerTotal > playerTotal) {
      setGameStatus('dealerWin');
      setMessage('Dealer wins');
    } else if (playerTotal > dealerTotal) {
      setGameStatus('playerWin');
      setMessage('You win!');
    } else {
      setGameStatus('push');
      setMessage('Push (Tie)');
    }
  };

  // Card component
  const Card = ({ card }) => {
    if (card.faceDown) {
      return (
        <div className="h-24 w-16 sm:h-28 sm:w-20 md:h-32 md:w-24 m-1 sm:m-2 rounded-lg shadow-lg bg-gray-700 flex items-center justify-center transform transition-transform duration-300 hover:rotate-3 border-2 border-gray-600">
          <div className="text-xl sm:text-2xl text-gray-400 font-bold">?</div>
        </div>
      );
    }
    
    const color = ['♥', '♦'].includes(card.suit) ? 'text-red-600' : 'text-gray-800';
    const isAce = card.value === 'A';
    const isFace = ['J', 'Q', 'K'].includes(card.value);
    
    return (
      <div className="h-24 w-16 sm:h-28 sm:w-20 md:h-32 md:w-24 m-1 sm:m-2 rounded-lg shadow-lg bg-white flex flex-col items-center justify-between p-2 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-300">
        <div className={`self-start text-xs sm:text-sm font-bold ${color}`}>{card.value}</div>
        <div className={`text-xl sm:text-2xl md:text-3xl ${color} ${isAce || isFace ? 'font-bold' : ''}`}>{card.suit}</div>
        <div className={`self-end text-xs sm:text-sm font-bold ${color}`}>{card.value}</div>
      </div>
    );
  };

  // Get status badge color based on game status
  const getStatusBadgeColor = () => {
    if (gameStatus === 'playerWin' || gameStatus === 'dealerBust') {
      return 'bg-green-800 text-green-100';
    } else if (gameStatus === 'dealerWin' || gameStatus === 'playerBust') {
      return 'bg-red-800 text-red-100';
    } else if (gameStatus === 'push') {
      return 'bg-yellow-800 text-yellow-100';
    }
    return 'bg-blue-800 text-blue-100';
  };

  // Get total badge color based on value
  const getTotalBadgeColor = (total) => {
    if (total > 21) {
      return 'bg-red-900 text-red-100';
    } else if (total === 21) {
      return 'bg-green-900 text-green-100';
    }
    return 'bg-gray-700 text-gray-100';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 mt-25 sm:p-6 md:p-8 bg-gray-900 rounded-xl md:rounded-2xl shadow-2xl relative overflow-hidden">
          <Navbar />
      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-purple-900 opacity-20 rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-blue-900 opacity-20 rounded-full transform -translate-x-16 sm:-translate-x-20 translate-y-16 sm:translate-y-20"></div>
      
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center text-gray-100 tracking-wide relative">
        <span className="relative z-10">
          Blackjack
          <span className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></span>
        </span>
      </h1>
      
      <div className={`${getStatusBadgeColor()} text-sm sm:text-base font-medium px-3 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md text-center mb-4 sm:mb-6 transform transition-all duration-500 animate-pulse`}>
        {message}
      </div>
      
      <div className="bg-gray-800 bg-opacity-80 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-md">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-200">Dealer</h3>
            {gameStatus !== 'playing' && calculateHandTotal(dealerHand) > 0 && (
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTotalBadgeColor(calculateHandTotal(dealerHand))}`}>
                Total: {calculateHandTotal(dealerHand)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap justify-center">
            {dealerHand.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>
        
        <div className="w-full border-t border-gray-700 my-3 sm:my-4"></div>
        
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-200">Player</h3>
            {calculateHandTotal(playerHand) > 0 && (
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTotalBadgeColor(calculateHandTotal(playerHand))}`}>
                Total: {calculateHandTotal(playerHand)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap justify-center">
            {playerHand.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-2 sm:space-x-4 mt-4 sm:mt-6 md:mt-8">
        {gameStatus === 'idle' || gameStatus !== 'playing' ? (
          <button 
            onClick={dealGame}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg transform transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Deal
          </button>
        ) : (
          <>
            <button 
              onClick={hit}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg transform transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Hit
            </button>
            <button 
              onClick={stand}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg transform transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Stand
            </button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Blackjack;