import React, { useState, useEffect } from 'react';
import GameCard from '../components/ui/GameCard';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const Casino = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  
  const categories = [
    { id: 'all', name: 'All Games' },
    { id: 'popular', name: 'Popular' },
    { id: 'table', name: 'Table Games' },
    { id: 'slots', name: 'Slots' },
    { id: 'specialty', name: 'Specialty' }
  ];

  useEffect(() => {
    const allGames = [
      { id: 1, name: 'Blackjack', image: '/src/assets/img/blackjack.png', category: ['popular', 'table'], root: 'blackjack', requiresAuth: true },
      { id: 2, name: 'Roulette', image: '/src/assets/img/roulette.png', category: ['popular', 'table'], root: 'roulette', requiresAuth: true },
      { id: 3, name: 'Slots', image: '/src/assets/img/slot.png', category: ['popular', 'slots'], root: 'slot', requiresAuth: true },
      { id: 4, name: 'Baccarat', image: '/src/assets/img/baccarat.png', category: ['table'], root: 'baccarat', requiresAuth: true },
      { id: 5, name: 'Poker', image: '/src/assets/img/poker.png', category: ['popular', 'table'], root: 'poker', requiresAuth: true },
      { id: 6, name: 'Crash', image: '/src/assets/img/crash.png', category: ['specialty'], root: 'crash', requiresAuth: true },
      { id: 7, name: 'Diamonds', image: '/src/assets/img/diamonds.png', category: ['slots'], root: 'diamonds', requiresAuth: true },
      { id: 8, name: 'Dragon Tower', image: '/src/assets/img/dragontower.png', category: ['specialty'], root: 'dragontower', requiresAuth: true },
      { id: 9, name: 'HiLo', image: '/src/assets/img/hilo.png', category: ['specialty'], root: 'hilo', requiresAuth: true },
      { id: 10, name: 'Keno', image: '/src/assets/img/keno.png', category: ['specialty'], root: 'keno', requiresAuth: true },
      { id: 11, name: 'Limbo', image: '/src/assets/img/limbo.png', category: ['specialty'], root: 'limbo', requiresAuth: true },
      { id: 12, name: 'Mines', image: '/src/assets/img/mines.png', category: ['popular', 'specialty'], root: 'mines', requiresAuth: true },
      { id: 13, name: 'Pump', image: '/src/assets/img/pump.png', category: ['specialty'], root: 'pump', requiresAuth: true },
      { id: 14, name: 'Cases', image: '/src/assets/img/cases.png', category: ['specialty'], root: 'cases', requiresAuth: true },
      { id: 15, name: 'Samurai', image: '/src/assets/img/samurai.png', category: ['slots'], root: 'samurai', requiresAuth: true }
    ];
    
    setGames(allGames);
    setFilteredGames(allGames);
  }, []);

  useEffect(() => {
    let result = games;
    
    if (activeCategory !== 'all') {
      result = result.filter(game => game.category.includes(activeCategory));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(game => game.name.toLowerCase().includes(query));
    }
    
    setFilteredGames(result);
  }, [activeCategory, searchQuery, games]);

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
        <Navbar/>
      
      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 mt-20">
        <div className="flex space-x-4 mb-4 md:mb-0 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 bg-gray-800 text-white border-none rounded-full ">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white border-none rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <svg 
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredGames.map(game => (
          <div key={game.id} className="flex flex-col items-center">
            <GameCard
              imageSrc={game.image} 
              altText={game.name} 
              root={game.root} 
              requiresAuth={game.requiresAuth} 
            />
            <p className="mt-2 text-center font-medium">{game.name}</p>
          </div>
        ))}
      </div>
      
      {filteredGames.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-xl">No games found. Try a different search or category.</p>
        </div>
      )}
      
      <div className="mt-16 mb-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="text-blue-500 text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">Instant Play</h3>
          <p className="text-gray-400">No downloads required. Play your favorite games directly in your browser.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="text-blue-500 text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Secure Gaming</h3>
          <p className="text-gray-400">All games are protected with advanced encryption for your safety. (brutal lie)</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="text-blue-500 text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Big Winnings</h3>
          <p className="text-gray-400">Try your luck with progressive jackpots and daily tournaments.</p>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Casino;