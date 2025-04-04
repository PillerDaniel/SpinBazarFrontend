import React from "react";
import "../App.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import BlackjackBanner from "../assets/img/blackjack.png";
import RouletteBanner from "../assets/img/roulette.png";
import SlotBanner from "../assets/img/slot.png";
import CasesBanner from "../assets/img/cases.png";
import PumpBanner from "../assets/img/pump.png";
import DiamondsBanner from "../assets/img/diamonds.png";

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
      id: "rl",
      imageSrc: RouletteBanner,
      altText: "Roulette Banner",
      root: "roulette",
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
      <main className="min-h-screen flex flex-col gap-6 pt-16 px-40 text-white mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col items-center justify-center p-6 space-y-6">
            <h1 className="mb-4 text-3xl font-extrabold text-white md:text-5xl lg:text-6xl text-center">
              {t("bonus_head")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
                {t("bonus_head_highlight")}
              </span>
            </h1>
            <p className="text-lg font-normal lg:text-xl text-gray-400 text-justify w-full">
              {t("bonus")}
            </p>
            <div className="w-full max-w-sm rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <BonusCard />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center justify-center p-6">
            {loading ? (
              <div className="text-center p-8">
                <p className="text-lg text-gray-400">
                  {t("loading_user_data", "Felhasználói adatok betöltése...")}
                </p>
              </div>
            ) : isAuthenticated ? (
              <UserCard />
            ) : (
              <div className="text-center p-8">
                <section>
                  <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                      {t("jumbotron_head")}
                    </h1>
                    <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-400">
                      {t("jumbotron_text")}
                    </p>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                      <button
                        onClick={() => navigate("/register")}
                        className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
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
                        className="py-3 px-5 sm:ms-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
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

        <div className="py-4">
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            {t("games_head_highlight")}{" "}
            <span className="animate-subtle-pulse text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500">
              {t("games_head")}
            </span>
          </h1>
          <div className="flex items-center justify-center">
            <GameCarousel games={gamesForCarousel} />
          </div>
        </div>

        <div className="w-full py-4 mb-16">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            {t("sportbet_head")}
            <mark className="relative align-baseline overflow-hidden px-2 text-white bg-blue-600 rounded-sm dark:bg-blue-500">
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