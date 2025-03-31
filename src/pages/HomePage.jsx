import React,{useEffect} from "react";
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

const HomePage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token"); 

    if (!token) {
        console.error("No token found");
        return;
    }

    const eventSource = new EventSource(`http://localhost:5001/user/event?token=${token}`);

    eventSource.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data); //-- userData is here for you Akos my beloved
            console.log("Received message:", message); 
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    };

    eventSource.onerror = () => {
        console.error("An error occurred with the EventSource.");
        eventSource.close();
    };

    return () => {
        eventSource.close();
        console.log("EventSource connection closed.");
    };
}, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col gap-6 pt-16 px-40 text-white mt-10">
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

          <div className="col-span-1 md:col-span-2 flex items-center justify-center">
            <UserCard/>
          </div>
        </div>

        <div className="flex items-center justify-center py-4">
          <GameCarousel
            games={[
              {
                imageSrc: BlackjackBanner,
                altText: "Blackjack Banner",
                root: "blackjack",
                requiresAuth: true,
              },
              {
                imageSrc: RouletteBanner,
                altText: "Roulete Banner",
                root: "roulette",
                requiresAuth: true,
              },
              {
                imageSrc: SlotBanner,
                altText: "Slot Banner",
                root: "slot",
                requiresAuth: true,
              },
              {
                imageSrc: CasesBanner,
                altText: "Cases Banner",
                root: "",
                requiresAuth: true,
              },
              {
                imageSrc: PumpBanner,
                altText: "Pump Banner",
                root: "",
                requiresAuth: true,
              },
              {
                imageSrc: DiamondsBanner,
                altText: "Diamonds Banner",
                root: "",
                requiresAuth: true,
              },
            ]}
          />
        </div>

        <div className="w-full flex items-center justify-center py-4 mb-15">
          <SportsBettingSection />
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default HomePage;
