import React, { useEffect } from "react";
import "../App.css";
import { useTranslation } from "react-i18next";


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

const HomePage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const eventSource = new EventSource(
      `http://localhost:5001/user/event?token=${token}`
    );
    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };
    eventSource.onerror = (error) => {
      console.error("An error occurred with the EventSource.", error);
      eventSource.close();
    };
    return () => {
      eventSource.close();
      console.log("EventSource connection closed.");
    };
  }, []);

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
          <div className="col-span-1 md:col-span-2 flex items-center justify-center">
            <UserCard />
          </div>
        </div>

        {/* GameCarousel Szekció */}
        <div className="py-4">
          <h1 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            {t("games_head_highlight")}{" "}
            <span className="animate-subtle-pulse text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500">
              {t("games_head")}
            </span>
          </h1>

          <div className="flex items-center justify-center">
            <GameCarousel games={gamesForCarousel} />
          </div>
        </div>

        {/* SportsBetting Szekció */}
        <div className="w-full py-4 mb-16">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            {t("sportbet_head")}
            <mark className="relative inline-block overflow-hidden animate-shimmer px-2 text-white bg-blue-600 rounded-sm dark:bg-blue-500">
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
