import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [isBottom, setIsBottom] = useState(false);

  const checkIfBottom = () => {
    const bottom = window.innerHeight + window.scrollY === document.documentElement.scrollHeight;
    setIsBottom(bottom);
  };

  useEffect(() => {
    window.addEventListener('scroll', checkIfBottom);
    return () => window.removeEventListener('scroll', checkIfBottom);
  }, []);

  return (
    <footer className={`bg-gray-800 fixed bottom-0 left-0 w-full shadow-sm transition-opacity duration-300 ${isBottom ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-screen-xl mx-auto p-2 md:flex md:items-center md:justify-between">
        <span className="text-sm sm:text-center text-gray-400">
          © 2025 <a href="#" className="hover:underline">SpinBazar™</a>. All Rights Reserved.
        </span>
        <span className="text-sm sm:text-center text-gray-400">
        <b>Fontos:</b> Ez az oldal egy vizsgaremek, nem igazi online kaszinó. Csak demonstrációs célokat szolgál.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-400 sm:mt-0">
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">About</a>
          </li>
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
          </li>
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
          </li>
          <li>
            <a href="#" className="hover:underline">Contact</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
