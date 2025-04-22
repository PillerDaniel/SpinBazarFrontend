import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-red-500 h-2"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-500 rounded-full p-3">
              <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-center mb-2">404</h1>
          <h2 className="text-2xl font-bold text-center mb-6 text-cyan-400">Oldal nem található</h2>
          
          <p className="text-gray-300 text-center mb-8">
            A keresett oldal nem létezik vagy eltávolításra került.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-md font-medium duration-150 ease-in-out hover:opacity-90 active:scale-95"
            >
              Vissza a főoldalra
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 text-center">
          <span className="text-sm text-gray-400">
            © 2025 SpinBazar - Minden jog fenntartva
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;