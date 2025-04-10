import React from "react";
import "../App.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import BlackjackBanner from "../assets/img/blackjack.png";
import SlotBanner from "../assets/img/slot.png";
import CasesBanner from "../assets/img/cases.png";
import PumpBanner from "../assets/img/pump.png";
import DiamondsBanner from "../assets/img/diamonds.png";
import MinesBanner from "../assets/img/mines.png";
import BonusCard from "../components/ui/BonusCard";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import GameCarousel from "../components/ui/GameCarousel";
import SportsBettingSection from "../components/ui/SportBettingSection";
import UserCard from "../components/ui/UserCard";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const gamesForCarousel = [
    {
      id: "bj",
      imageSrc: BlackjackBanner,
      altText: "Blackjack Banner",
      root: "blackjack",
      requiresAuth: true,
    },
    {
      id: "mi",
      imageSrc: MinesBanner,
      altText: "Mines Banner",
      root: "mines",
      requiresAuth: true,
    },
    {
      id: "sl",
      imageSrc: SlotBanner,
      altText: "Slot Banner",
      root: "slot",
      requiresAuth: true,
    },
    {
      id: "cs",
      imageSrc: CasesBanner,
      altText: "Cases Banner",
      root: "cases",
      requiresAuth: true,
    },
    {
      id: "pm",
      imageSrc: PumpBanner,
      altText: "Pump Banner",
      root: "pump",
      requiresAuth: true,
    },
    {
      id: "dm",
      imageSrc: DiamondsBanner,
      altText: "Diamonds Banner",
      root: "diamonds",
      requiresAuth: true,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col gap-6 pt-16 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 text-white mt-6 md:mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col items-center justify-center p-6 space-y-6">
            <h1 className="mb-4 text-3xl font-extrabold text-white md:text-5xl lg:text-6xl text-center">
              {t("bonus_head")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
                {" "}
                {t("bonus_head_highlight")}
              </span>
            </h1>
            <p className="text-lg font-normal lg:text-xl text-gray-400 text-center md:text-left w-full">
              {t("bonus")}
            </p>
            <div className="w-full max-w-sm rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <BonusCard />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center justify-center p-6">
            {loading ? (
              <div className="text-center p-4 sm:p-8">
                <p className="text-lg text-gray-400">
                  {t("loading_user_data", "Felhasználói adatok betöltése...")}
                </p>
              </div>
            ) : isAuthenticated ? (
              <UserCard />
            ) : (
              <div className="text-center p-4 sm:p-8 w-full">
                <section>
                  <div className="py-6 px-2 sm:py-8 sm:px-4 mx-auto max-w-screen-xl text-center lg:py-12">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-white">
                      {t("jumbotron_head")}
                    </h1>
                    <p className="mb-8 text-lg font-normallg:text-xl px-4 sm:px-8 md:px-16 lg:px-24 text-gray-400">
                      {t("jumbotron_text")}
                    </p>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={() => navigate("/register")}
                        className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-900"
                      >
                        {t("register_button")}
                        <svg
                          className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate("/login")}
                        className="py-3 px-5 text-sm font-medium focus:outline-none rounded-lg border  focus:z-10 focus:ring-4 focus:ring-gray-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
                      >
                        {t("login_button")}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        <div className="py-8">
          <h1 className="mb-4 text-3xl font-extrabold text-white md:text-5xl lg:text-6xl">
            {t("games_head_highlight")}{" "}
            <span className="animate-subtle-pulse text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500">
              {t("games_head")}
            </span>
          </h1>
          <div className="flex items-center justify-center">
            <GameCarousel games={gamesForCarousel} />
          </div>
        </div>

        <div className="w-full py-8 mb-12 md:mb-16">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl text-white">
            {t("sportbet_head")}
            <mark className="relative align-baseline inline-block overflow-hidden px-2 text-white rounded-sm bg-blue-500 ml-2">
              {t("sportbet_head_highlight")}
            </mark>
          </h1>
          <div className="flex items-center justify-center">
            <SportsBettingSection />
          </div>
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default HomePage;