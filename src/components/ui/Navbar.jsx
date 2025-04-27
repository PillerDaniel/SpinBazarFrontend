import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CircleUser, Languages, TriangleAlert, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReactDOM from "react-dom";

import UserMenu from "./UserMenu";

import CasinoActiveImg from "../../assets/img/casino-btn-active.jpg";
import CasinoInactiveImg from "../../assets/img/casino-btn-inactive.jpg";
import SportActiveImg from "../../assets/img/sport-btn-active.jpg";
import SportInactiveImg from "../../assets/img/sport-btn-inactive.jpg";
import Logo from "../../assets/img/SpinBazar.svg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState("casino");
  const [hoverTab, setHoverTab] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const openAlertModal = () => setIsAlertModalOpen(true);
  const closeAlertModal = () => setIsAlertModalOpen(false);

  const { t, i18n } = useTranslation();
  const changeLanguage = () => {
    const newLanguage = i18n.language === "en" ? "hu" : "en";
    i18n.changeLanguage(newLanguage);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/sportbet')) {
      setActiveTab('sports');
    } else if (path.includes('/casino')) {
      setActiveTab('casino');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setVisible(false);
        setMenuOpen(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const getButtonImage = (tabName) => {
    const isActive = activeTab === tabName;
    const isHovered = hoverTab === tabName;
    if (tabName === "casino") {
      return isActive || isHovered ? CasinoActiveImg : CasinoInactiveImg;
    } else {
      return isActive || isHovered ? SportActiveImg : SportInactiveImg;
    }
  };

  return (
    <nav
      className={`bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-900/50 shadow-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-3 sm:px-4 md:px-6 py-2 md:py-4">
        {/* Bal oldali elemek */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 rtl:space-x-reverse">
          <a
            href="/"
            className="hidden md:inline-flex items-center"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <img
              src={Logo}
              className="h-10 md:h-12 pr-2 md:pr-3 cursor-pointer"
              alt="Spinbazar Logo"
            />
          </a>

          <button
            onClick={changeLanguage}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors duration-200 focus:outline-none"
            aria-label={t("change_language_aria_label", {
              currentLang: i18n.language === "en" ? "English" : "Magyar",
            })}
            title={t("change_language_title", {
              nextLang: i18n.language === "en" ? "Magyar" : "English",
            })}
          >
            <Languages size={18} md:size={20} />
          </button>
        </div>

        {/* Középső elemek (Casino/Sport Tabok) */}
        <div className="flex items-center justify-center">
          <div className="inline-flex space-x-1 md:space-x-2 overflow-hidden">
            <button
              onClick={() => {
                handleTabChange("casino");
                navigate("/casino");
              }}
              onMouseEnter={() => setHoverTab("casino")}
              onMouseLeave={() => setHoverTab(null)}
              className="relative overflow-hidden h-8 px-3 text-xs sm:h-9 sm:px-4 md:h-10 md:px-6 md:text-sm uppercase font-medium text-white flex items-center justify-center transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
              <img
                src={getButtonImage("casino")}
                alt="Casino"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
              />
              <span className="relative z-10 whitespace-nowrap">
                {t("navbar_casino_button", "Casino")}
              </span>
            </button>

            <button
              onClick={() => {
                handleTabChange("sports");
                navigate("/sportbet");
              }}
              onMouseEnter={() => setHoverTab("sports")}
              onMouseLeave={() => setHoverTab(null)}
              className="relative overflow-hidden h-8 px-3 text-xs sm:h-9 sm:px-4 md:h-10 md:px-6 md:text-sm uppercase font-medium text-white flex items-center justify-center transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
              <img
                src={getButtonImage("sports")}
                alt="Sports"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
              />
              <span className="relative z-10 whitespace-nowrap">
                {t("navbar_sports_button", "Sports")}
              </span>
            </button>
          </div>
        </div>

        {/* Jobb oldali elemek (Bejelentkezés/Regisztráció) */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 rtl:space-x-reverse">
          <button
            onClick={openAlertModal}
            className="group p-2.5 text-yellow-400 rounded-lg transition-all duration-300 ease-in-out hover:text-yellow-300 hover:scale-110"
          >
            <TriangleAlert
              size={28}
              sm:size={22}
              md:size={24}
              className="animate-pulse-glow-filter group-hover:animate-none group-hover:filter-drop-shadow-glow-yellow-hover"
            />
          </button>

          {user ? (
            <div className="relative flex items-center mr-10">
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none rounded-full p-0.5"
              >
                <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-600 ring-1 ring-gray-500 group-hover:ring-blue-400 transition-shadow">
                  <CircleUser className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                </span>
                <span className="hidden md:inline text-xs md:text-sm pr-1">
                  {user.userName}
                </span>
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
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-xs px-3 py-1.5 sm:px-4 sm:py-2 md:text-sm text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 whitespace-nowrap"
              >
                {t("navbar_register_button", "Register")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/Login")}
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-xs px-3 py-1.5 sm:px-4 sm:py-2 md:text-sm text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800 whitespace-nowrap"
              >
                {t("navbar_login_button", "Login")}
              </button>
            </>
          )}
        </div>
      </div>

      {isAlertModalOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            onClick={closeAlertModal}
          >
            <div
              className="bg-gray-800 mr-9 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md text-white border border-yellow-500/50 transform transition-transform duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-yellow-400 flex items-center">
                  <TriangleAlert
                    className="mr-2 flex-shrink-0"
                    size={22}
                    sm:size={24}
                  />
                  {t("alert_modal_title")}
                </h3>
                <button
                  onClick={closeAlertModal}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
                  aria-label={t("close_modal_label")}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-300 text-sm md:text-base text-justify">
                {t("alert_modal_content")}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeAlertModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs px-4 py-2 sm:text-sm sm:px-5 sm:py-2.5 focus:ring-4 focus:outline-none focus:ring-blue-800"
                >
                  {t("alert_modal_close_button")}
                </button>
              </div>
            </div>
          </div>,
          document.getElementById("modal-portal")
        )}
    </nav>
  );
};

export default Navbar;
