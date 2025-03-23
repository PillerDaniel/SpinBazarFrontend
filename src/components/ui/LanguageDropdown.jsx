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
        className="text-white focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-4 py-2 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800 inline-flex items-center"
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
          className="absolute top-full right-0 mt-2 z-10 divide-y divide-gray-100 rounded-lg shadow-sm w-36 bg-gray-700"
        >
          <ul className="py-2 text-sm text-gray-200 text-center">
            <li>
              <button
                onClick={() => selectLanguage("en")}
                className="w-full text-left block px-4 py-2 hover:bg-gray-600 hover:text-white"
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
                className="w-full text-left block px-4 py-2 hover:bg-gray-600 hover:text-white"
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