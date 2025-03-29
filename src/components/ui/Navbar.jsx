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

  return (
    <nav
      className={`bg-gray-900 fixed w-full z-20 top-0 start-0 border transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <a href="/" className="flex items-center">
            <img src={Logo} className="h-12 pr-3" alt="Spinbazar Logo" />
          </a>
          <LanguageDropdown changeLanguage={changeLanguage} i18n={i18n} />
        </div>

        <div className="ml-auto flex space-x-3 rtl:space-x-reverse">
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
