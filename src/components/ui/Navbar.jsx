import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/img/SpinBazar.svg";
import { CircleUser, Languages } from "lucide-react";
import UserMenu from "./UserMenu";
import { useTranslation } from "react-i18next";
import CasinoActiveImg from "../../assets/img/casino-btn-active.jpg";
import CasinoInactiveImg from "../../assets/img/casino-btn-inactive.jpg";
import SportActiveImg from "../../assets/img/sport-btn-active.jpg";
import SportInactiveImg from "../../assets/img/sport-btn-inactive.jpg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState("casino");
  const [hoverTab, setHoverTab] = useState(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const { t, i18n } = useTranslation();

  const changeLanguage = () => {
    const newLanguage = i18n.language === "en" ? "hu" : "en";
    i18n.changeLanguage(newLanguage);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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
      return (isActive || isHovered) ? CasinoActiveImg : CasinoInactiveImg;
    } else {
      return (isActive || isHovered) ? SportActiveImg : SportInactiveImg;
    }
  };

  return (
    <nav
      className={`bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-900 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    > 
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-2 md:p-4">
        
        <div className="flex items-center space-x-2 md:space-x-3 rtl:space-x-reverse">
          <a href="/" className="flex items-center">
            <img 
              src={Logo} 
              className="h-10 md:h-12 pr-2 md:pr-3 cursor-pointer" 
              alt="Spinbazar Logo" 
              onClick={(e) => { e.preventDefault(); navigate('/'); }} 
            />
          </a>
          <button
            onClick={changeLanguage}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            aria-label={t('change_language_aria_label', { currentLang: i18n.language === 'en' ? 'English' : 'Magyar' })}
            title={t('change_language_title', { nextLang: i18n.language === 'en' ? 'Magyar' : 'English' })}
          >
            <Languages size={18} md:size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center"> 
          <div className="inline-flex space-x-1 md:space-x-2 overflow-hidden">
            <button
              onClick={() => {
                handleTabChange("casino");
                navigate("/casino");
              }}
              onMouseEnter={() => setHoverTab("casino")}
              onMouseLeave={() => setHoverTab(null)}
              className="relative overflow-hidden h-8 px-3 text-xs md:h-10 md:px-6 md:text-sm uppercase font-medium text-white flex items-center justify-center transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
              <img
                src={getButtonImage("casino")}
                alt="Casino"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
              />
              <span className="relative z-10 whitespace-nowrap">{t('navbar_casino_button', 'Casino')}</span> 
            </button>
            <button
              onClick={() => {
                 handleTabChange("sports");
                 navigate(""); 
              }}
              onMouseEnter={() => setHoverTab("sports")}
              onMouseLeave={() => setHoverTab(null)}
              className="relative overflow-hidden h-8 px-3 text-xs md:h-10 md:px-6 md:text-sm uppercase font-medium text-white flex items-center justify-center transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
              <img
                src={getButtonImage("sports")}
                alt="Sports"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
              />
              <span className="relative z-10 whitespace-nowrap">{t('navbar_sports_button', 'Sports')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 rtl:space-x-reverse">
          {user ? (
            <div className="flex items-center space-x-2 md:space-x-3">
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 rounded-full pr-1 md:pr-2"
              >
                <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-600 ring-1 ring-gray-500 group-hover:ring-blue-400 transition-shadow">
                  <CircleUser className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                </span>
                <span className="hidden sm:inline text-xs md:text-sm">{user.userName}</span> 
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
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-xs px-3 py-1 md:text-sm md:px-4 md:py-2 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 whitespace-nowrap"
              >
                {t("navbar_register_button")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/Login")}
                className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-xs px-3 py-1 md:text-sm md:px-4 md:py-2 text-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-800 whitespace-nowrap"
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