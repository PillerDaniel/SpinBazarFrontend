import React, { useState } from "react";

const LanguageDropdown = ({ changeLanguage, i18n }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectLanguage = (language) => {
    changeLanguage(language);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative ml-auto flex">
      <button
        onClick={toggleDropdown}
        type="button"
        className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 inline-flex items-center"
      >
        {i18n.language === "en" ? (
          <img
            src="https://flagcdn.com/w40/gb.png"
            alt="UK Flag"
            width="20"
            className="mr-2"
          />
        ) : (
          <img
            src="https://flagcdn.com/w40/hu.png"
            alt="Hungarian Flag"
            width="20"
            className="mr-2"
          />
        )}
        {i18n.language === "en" ? "English" : "Magyar"}
        <svg
          className="w-2.5 h-2.5 ml-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div
          className="absolute top-full right-0 mt-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-36 dark:bg-gray-700"
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200 text-center">
            <li>
              <button
                onClick={() => selectLanguage("en")}
                className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  alt="UK Flag"
                  width="20"
                  className="inline mr-2"
                />
                English
              </button>
            </li>
            <li>
              <button
                onClick={() => selectLanguage("hu")}
                className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <img
                  src="https://flagcdn.com/w40/hu.png"
                  alt="Hungarian Flag"
                  width="20"
                  className="inline mr-2"
                />
                Magyar
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;