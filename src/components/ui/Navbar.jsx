import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/img/SpinBazar.svg";
import { CircleUser } from "lucide-react";
import UserMenu from "./UserMenu";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "./LanguageDropdown";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down, hide navbar
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setVisible(false);
      } 
      // If scrolling up or at the top, show navbar
      else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav 
      className={`bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-600 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <a href="/" className="flex items-center">
            <img src={Logo} className="h-12 pr-3" alt="Spinbazar Logo" />
          </a>
        </div>

        {user && (
          <div className="relative inline-flex items-center justify-center mb-2 me-2 overflow-hidden text-sm font-medium text-white">
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
              <span className="text-lg font-semibold text-gray-100">
                <b>{user?.walletBalance}$</b>
              </span>
            </span>
          </div>
        )}

        <div className="ml-auto flex space-x-3 rtl:space-x-reverse">
          <LanguageDropdown changeLanguage={changeLanguage} i18n={i18n} />

          {user ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-1 rtl:space-x-reverse"
              >
                <div className="flex">
                  <span className="text-white font-medium mr-1">
                    {user.userName}
                  </span>
                  <CircleUser className="text-white w-6 h-6 transform hover:scale-110" />
                </div>
              </button>
              <UserMenu
                isOpen={menuOpen}
                onClose={closeMenu}
                isLoggedIn={true}
                onLogout={handleLogout}
                userRole={user.role}
              />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/Register")}
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
              >
                {t("navbar_register_button")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/Login")}
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800"
              >
                {t("navbar_login_button")}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;