import React from 'react';
import { Trophy, ChevronRight, Calendar, Star, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

export default function Sport() {
  return (
    <div className="min-h-screen text-white flex flex-col mt-20 mb-15">
      <Navbar/>

      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-4 mb-6 flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
              <p>Ez az oldal a projekt keretein belül nem fog elkészülni, csak egy tovább fejlesztési lehetőség.</p>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">Sport</span>
                <span className="text-cyan-400">fogadás.</span>
              </h1>
              <p className="text-gray-300">Fogadj kedvenc sporteseményeidre és nyerj extra jutalmakat minden nap!</p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Kiemelt mérkőzések</h2>
                <button className="flex items-center text-sm text-cyan-400 hover:text-cyan-300">
                  Összes megtekintése
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-800/75 rounded-lg p-3">
                {[
                  { teams: 'Real Madrid vs Barcelona', league: 'La Liga', time: 'Ma, 20:45', odds: ['2.10', '3.40', '3.20'] },
                  { teams: 'Manchester City vs Liverpool', league: 'Premier League', time: 'Holnap, 17:30', odds: ['1.95', '3.50', '3.70'] },
                  { teams: 'Bayern München vs Dortmund', league: 'Bundesliga', time: 'Holnap, 18:30', odds: ['1.75', '3.90', '4.20'] }
                ].map((match, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-750 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-gray-400 text-xs mr-2">{match.league}</span>
                          <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                          <span className="text-gray-400 text-xs">{match.time}</span>
                        </div>
                        <div className="font-semibold">{match.teams}</div>
                      </div>
                      <div className="flex space-x-2">
                        {match.odds.map((odd, oddIndex) => (
                          <button key={oddIndex} className="bg-gray-700 hover:bg-blue-700 transition px-3 py-1 rounded text-center min-w-14">
                            <span className="block text-sm">{['1', 'X', '2'][oddIndex]}</span>
                            <span className="font-semibold">{odd}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Népszerű sportok</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-800/75 rounded-lg p-3">
                {['Futball', 'Kosárlabda', 'Tenisz', 'Jégkorong', 'MMA', 'Kézilabda', 'E-sport', 'Amerikai foci'].map((sport, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition cursor-pointer">
                    {sport}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-1/3">
            <div className="bg-gradient-to-r from-purple-800 to-blue-700 rounded-lg p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-20">
                <Trophy className="h-32 w-32 -mt-6 -mr-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Napi sportfogadási bónusz</h3>
              <p className="text-gray-200 mb-4">Szerezd meg a napi bónuszt és használd fel fogadásaidra!</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-300">Mai bónusz</span>
                  <div className="text-2xl font-bold text-yellow-400">2$</div>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded font-semibold">
                  Begyűjtés
                </button>
              </div>
            </div>

            <div className="bg-blue-900 bg-opacity-40 rounded-lg p-5">
              <h3 className="font-bold mb-3">Sportfogadási előnyök</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-full p-2 mr-3">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Élő fogadás</h4>
                    <p className="text-sm text-gray-300">Fogadj meccs közben a legjobb oddsokkal</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-600 rounded-full p-2 mr-3">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Napi bónuszok</h4>
                    <p className="text-sm text-gray-300">Szerezz extra jutalmakat minden nap</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-600 rounded-full p-2 mr-3">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold">VIP előnyök</h4>
                    <p className="text-sm text-gray-300">Exkluzív ajánlatok VIP tagoknak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}