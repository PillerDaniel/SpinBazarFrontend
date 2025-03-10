import React, { useEffect, useState } from 'react';

const UserMenu = ({ isOpen, onClose, onLogout }) => {
  const [menuPosition, setMenuPosition] = useState('translate-x-full');

  useEffect(() => {
    if (isOpen) {
      setMenuPosition('translate-x-0');
    } else {
      const timeout = setTimeout(() => {
        setMenuPosition('translate-x-full');
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto bg-white w-64 dark:bg-gray-800 transition-transform duration-500 ease-in-out transform ${menuPosition}`}
    >
      <button
        onClick={onClose}
        className="text-white-400 bg-transparent hover:text-white-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 left-2.5"
      >
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white ease-in-out transform hover:scale-110"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18 17.94 6M18 18 6.06 6"
          />
        </svg>
      </button>
      <div className="py-4">
        <h5 className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400 mt-5 mb-2">
          Felhasználó
        </h5>
        <ul className="space-y-2 font-medium">
          <li>
            <button
              onClick={onLogout}
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-red-400 rtl:rotate-180 ease-in-out transform group-hover:scale-110"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                />
              </svg>
              <span className="flex ml-3 text-red-400 whitespace-nowrap">Kijelentkezés</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserMenu;
