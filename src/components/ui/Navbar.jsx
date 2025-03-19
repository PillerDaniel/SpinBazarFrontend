import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/img/SpinBazar.svg";
import { CircleUser } from "lucide-react";
import UserMenu from "./UserMenu";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const { t, i18n } = useTranslation();

  const changeLanguage = () => {
    const newLanguage = i18n.language === "en" ? "hu" : "en";
    i18n.changeLanguage(newLanguage);
  };
  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <a href="/" className="flex items-center">
            <img src={Logo} className="h-12 pr-3" alt="Spinbazar Logo" />
          </a>
        </div>

        <div className="relative inline-flex items-center justify-center mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 dark:text-white">
          <span className="relative flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-br from-green-400 to-blue-600 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-wallet-minimal text-white"
            >
              <path d="M17 14h.01" />
              <path d="M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14" />
            </svg>
            <span className="text-lg font-semibold text-gray-100 dark:text-gray-100">
              <b>{user?.walletBalance}$</b>
            </span>
          </span>
        </div>

        <div className="ml-auto flex space-x-3 rtl:space-x-reverse">
          {user ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-1 rtl:space-x-reverse"
              >
                <div className="flex transform hover:scale-110">
                  <span className="text-gray-900 dark:text-white font-medium mr-1">
                    {user.userName}
                  </span>
                  <CircleUser className="text-gray-700 dark:text-white w-6 h-6" />
                </div>
                
              </button>
              <UserMenu
                isOpen={menuOpen}
                onClose={closeMenu}
                isLoggedIn={true}
                onLogout={handleLogout}
              />
              <button
                    onClick={changeLanguage}
                    type="button"
                    className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                  >
                    {i18n.language === "en" ? "HUN" : "ENG"}
                  </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/Register")}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Regisztráció
              </button>{" "}
              <button
                type="button"
                onClick={() => navigate("/Login")}
                className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Bejelentkezés
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
