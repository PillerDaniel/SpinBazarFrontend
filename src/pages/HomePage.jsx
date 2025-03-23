import React from "react";
import "../App.css";

import BlackjackBanner from "../assets/img/blackjack.png";
import RouletteBanner from "../assets/img/roulette.png";
import SlotBanner from "../assets/img/slot.png";

import GameCard from "../components/ui/GameCard";
import BonusCard from "../components/ui/BonusCard";
import Footer from "../components/ui/Footer";
import Navbar from "../components/ui/Navbar";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import HomeSatistics from "../components/ui/HomeStatistics";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main className="min-h-screen grid grid-rows-3 gap-6 pt-16 px-40 text-white mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col items-center justify-center p-6 space-y-6 border-white">
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

          <div className="col-span-1 md:col-span-2 flex items-center justify-center border border-white p-10">
            <HomeSatistics  isLoggedIn={isAuthenticated}/>
          </div>
        </div>

        <div className="flex items-center justify-center border border-white py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <GameCard
              imageSrc={BlackjackBanner}
              altText="Blackjack Banner"
              root="blackjack"
              requiresAuth={true}
            />
            <GameCard
              imageSrc={RouletteBanner}
              altText="Roulete Banner"
              root="roulette"
              requiresAuth={true}
            />
            <GameCard
              imageSrc={SlotBanner}
              altText="Slot Banner"
              root="slot"
              requiresAuth={true}
            />
            
          </div>
        </div>

        <div className="flex items-center justify-center border border-white py-4 mb-15">
          <p className="text-lg font-normal  lg:text-xl text-gray-400">
            Sportfogadás
          </p>
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default HomePage;
