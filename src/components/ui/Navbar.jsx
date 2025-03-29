import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/img/SpinBazar.svg";
import { CircleUser } from "lucide-react";
import UserMenu from "./UserMenu";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "./LanguageDropdown";
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
  const [activeTab, setActiveTab] = useState("casino"); // Default to casino
  const [hoverTab, setHoverTab] = useState(null);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Add any navigation or state changes needed when switching tabs
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setVisible(false);
      }
      else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Helper to determine which image to show
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
      className={`bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-800 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        {/* Left section */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <a href="/" className="flex items-center">
            <img src={Logo} className="h-12 pr-3" alt="Spinbazar Logo" />
          </a>
          <LanguageDropdown changeLanguage={changeLanguage} i18n={i18n} />
        </div>

        {/* Center section - Tab buttons */}
        <div className="flex items-center justify-center">
          <div className="inline-flex space-x-2 overflow-hidden">
            <button
              onClick={() => handleTabChange("casino")}
              onMouseEnter={() => setHoverTab("casino")}
              onMouseLeave={() => setHoverTab(null)}
              className="relative overflow-hidden h-10 px-6 uppercase font-medium text-white flex items-center justify-center transition-all duration-200 rounded-md"
              style={{ width: "120px" }}
            >
              <img 
                src={getButtonImage("casino")} 
                alt="Casino" 
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
              />
              <span className="relative z-10">Casino</span>
            </button>
            <button
              onClick={() => handleTabChange("sports")}
              onMouseEnter={() => setHoverTab("sports")}
              onMouseLeave={() => setHoverTab(null)}
              className="relative overflow-hidden h-10 px-6 uppercase font-medium text-white flex items-center justify-center transition-all duration-200 rounded-md"
              style={{ width: "120px" }}
            >
              <img 
                src={getButtonImage("sports")} 
                alt="Sports" 
                className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
              />
              <span className="relative z-10">Sports</span>
            </button>
          </div>
        </div>

        {/* Right section */}
        <div className="flex space-x-3 rtl:space-x-reverse">
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