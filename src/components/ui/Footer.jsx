import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [isBottom, setIsBottom] = useState(false);

  const checkIfBottom = () => {
    const bottomReached = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
    setIsBottom(bottomReached);
  };

  useEffect(() => {
    checkIfBottom();
    window.addEventListener('scroll', checkIfBottom, { passive: true });
    window.addEventListener('resize', checkIfBottom);

    return () => {
      window.removeEventListener('scroll', checkIfBottom);
      window.removeEventListener('resize', checkIfBottom);
    }
  }, []);

  return (
    <footer className={`bg-gray-900 border-gray-900 text-gray-400 fixed bottom-0 left-0 w-full shadow-lg transition-opacity duration-500 ease-in-out ${isBottom ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="max-w-screen-xl mx-auto px-4 py-4 md:px-6 md:py-5">
        <div className="md:flex md:items-center md:justify-between text-center md:text-left">

          <div className="mb-4 md:mb-0 space-y-1">
            <span className="block text-sm">
              © 2025 <a href="#" className="hover:underline hover:text-gray-200">SpinBazar™</a>. All Rights Reserved.
            </span>
          </div>

          <ul className="flex flex-wrap items-center justify-center md:justify-end text-sm font-medium">
            <li className="mb-2 md:mb-0">
              <a href="#" className="hover:underline hover:text-gray-200 me-4 md:me-6">About</a>
            </li>
            <li className="mb-2 md:mb-0">
              <a href="#" className="hover:underline hover:text-gray-200 me-4 md:me-6">Privacy Policy</a>
            </li>
            <li className="mb-2 md:mb-0">
              <a href="#" className="hover:underline hover:text-gray-200 me-4 md:me-6">Licensing</a>
            </li>
            <li> 
              <a href="#" className="hover:underline hover:text-gray-200">Contact</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;