import React, { useState } from "react"; // useEffect eltávolítva, ha nincs rá szükség
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WarningAlert from "./WarningAlert";
import {
  X,
  User,
  ShieldCheck,
  BarChartHorizontal,
  Settings,
  LogOut as LogOutIcon,
  Wallet, // Wallet ikon importálva, de nincs használva a kódban
} from "lucide-react";
import Logo from "../../assets/img/SpinBazar.svg"; // Ellenőrizd az útvonalat

const UserMenu = ({ isOpen, onClose, onLogout, userRole }) => {
  const { t } = useTranslation();
  const [warningMessage, setWarningMessage] = useState("");
  const navigate = useNavigate();
  const isAdmin = userRole === "admin";

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    }
    onClose(); // Menü bezárása navigáció után
  };

  const handleSettingsClick = () => {
    setWarningMessage(
      t("settings_warning", "Settings are currently unavailable.")
    );
  };

  const handleCloseWarning = () => {
    setWarningMessage("");
  };

   // Extra: Kezeljük a háttérre kattintást a menü bezárásához (Overlay)
   const handleOverlayClick = (e) => {
       // Csak akkor zárjuk be, ha magára az overlay-re kattintottak, nem a menüre
       if (e.target === e.currentTarget) {
           onClose();
       }
   };


  return (
    ReactDOM.createPortal(
    <>
      {/* Overlay a menü mögött */}
      <div
         className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
         onClick={handleOverlayClick} // Kattintás kezelő az overlay-en
         aria-hidden="true"
      />

      {warningMessage && (
        <div className="fixed top-5 right-5 z-[60]">
          <WarningAlert message={warningMessage} onClose={handleCloseWarning} />
        </div>
      )}

      <div
        className={`fixed top-0 right-0 z-50 min-h-screen h-full
                   w-72 bg-slate-900 border-l border-slate-700/50 shadow-xl
                   transition-all duration-300 ease-in-out transform flex flex-col  // Duration csökkentve 300ms-ra
                   ${
                     isOpen
                       ? "translate-x-0 opacity-100"
                       : "translate-x-full opacity-0 pointer-events-none"
                   }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-menu-title" // Adjunk egy látható címet is, ha van (pl. h2 id="user-menu-title")
        aria-hidden={!isOpen}
      >
        {/* --- Menu Header --- */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
          {/* Javított link/gomb a logóhoz */}
          <button // Gombot használunk, ha nincs href és csak onClick van
            className="inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 rounded" // Fókusz stílus
            onClick={() => {
              // Nincs szükség e.preventDefault()-ra button esetén
              navigate("/");
              onClose(); // Menü bezárása a főoldalra navigálás után
            }}
            aria-label={t('go_to_homepage_aria', 'Go to homepage')} // Hozzáférhetőség
          >
            <img src={Logo} className="h-8" alt="Spinbazar Logo" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-slate-700 hover:text-white rounded-lg p-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-600 mr-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- Menu Content --- */}
        <div className="flex-grow p-4 pb-16 overflow-y-auto">
          {/* Profil Szekció */}
          <ul className="space-y-1 font-medium">
            <li>
              <button
                onClick={() => handleNavigate("/profile")}
                className="flex items-center w-full p-3 rounded-lg text-base text-gray-200 hover:bg-slate-700/70 group transition-colors duration-200 focus:outline-none focus:bg-slate-700/70" // Fókusz stílus
              >
                <User className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
                <span className="ml-3">{t("account", "Account")}</span>
              </button>
            </li>
          </ul>

          <hr className="my-4 border-slate-700/50" />

          {/* Általános Szekció */}
          <ul className="space-y-1 font-medium">
            <li>
              <button
                onClick={() => handleNavigate("/statistics")}
                className="flex items-center w-full p-3 rounded-lg text-base text-gray-200 hover:bg-slate-700/70 group transition-colors duration-200 focus:outline-none focus:bg-slate-700/70"
              >
                <BarChartHorizontal className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
                <span className="ml-3">{t("statistics", "Statistics")}</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleSettingsClick}
                className="flex items-center w-full p-3 rounded-lg text-base text-gray-200 hover:bg-slate-700/70 group transition-colors duration-200 focus:outline-none focus:bg-slate-700/70"
              >
                <Settings className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
                <span className="ml-3">{t("settings", "Settings")}</span>
              </button>
            </li>
          </ul>

          {/* Admin Szekció */}
          {isAdmin && (
            <>
              <hr className="my-4 border-slate-700/50" />
              <ul className="space-y-1 font-medium">
                <li>
                  <button
                    onClick={() => handleNavigate("/admin/dashboard")}
                    className="flex items-center w-full p-3 rounded-lg text-base text-yellow-400 hover:bg-slate-700/70 group transition-colors duration-200 focus:outline-none focus:bg-slate-700/70"
                  >
                    <ShieldCheck className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-200" />
                    <span className="ml-3">
                      {t("admin_panel", "Admin Panel")}
                    </span>
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-slate-700/50 flex-shrink-0">
          <button
            onClick={() => {
               onLogout();
               onClose();
            }}
            className="flex items-center w-full p-3 rounded-lg text-base text-red-400 hover:bg-red-900/30 group transition-colors duration-200 focus:outline-none focus:bg-red-900/30" // Fókusz stílus
          >
            <LogOutIcon className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors duration-200" />
            <span className="ml-3 font-medium">
              {t("sign_out_usermenu", "Sign Out")}
            </span>
          </button>
        </div>
      </div>
    </>,
    document.getElementById("modal-portal"))
  );
};

export default UserMenu;