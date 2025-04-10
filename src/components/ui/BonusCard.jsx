import React from 'react';
import { useTranslation } from "react-i18next";
import { Gift, ArrowRight } from 'lucide-react';

const BonusCard = () => {
  const { t } = useTranslation();

  return (
    // --- Változás: w-full hozzáadva, max-w-sm alapértelmezett (mobil), md:max-w-md közepes képernyőktől ---
    <div className="group relative w-full max-w-sm md:max-w-md rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 ease-in-out hover:scale-[1.03]">
      {/* Háttér rétegek változatlanok */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-red-600 z-0"></div>
      <div className="absolute inset-0 bonus-card-noise z-[1] opacity-15"></div>
      <div className="absolute inset-0 bonus-card-glow z-[2] opacity-80"></div>

      <Gift
        size={220} // Megjegyzés: A méret reszponzív állítása JS-t vagy CSS változót igényelne
        // --- Változás: Alapértelmezett pozíció kisebb képernyőkre, sm: prefixszel a nagyobbakra ---
        className="absolute -bottom-8 -right-8 sm:-bottom-12 sm:-right-12 text-white/20 z-[3] transform rotate-[25deg] transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-105"
        strokeWidth={1}
      />

      {/* Shine réteg változatlan */}
      <div className="bonus-card-shine absolute inset-0 z-[4]"></div>

      {/* Tartalom rész - padding és min-height már reszponzív volt */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]">
        <div>
          {/* Fejléc és szöveg - text size már reszponzív volt */}
          <h5 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight text-shadow">
            {t('bonus_card_head', 'Exkluzív Bónusz!')}
          </h5>
          <p className="text-base text-gray-200 mb-6 leading-relaxed">
            {t('bonus_card_text', 'Ne maradj le a különleges ajánlatról! Aktiváld most és nyerj nagyot.')}
          </p>
        </div>

        {/* Gomb rész változatlan - a fix méretek (text-sm, px, py) általában rendben vannak */}
        <div className="flex justify-start mt-auto">
          <button
            type="button"
            className="inline-flex items-center space-x-2 text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-semibold rounded-lg text-sm px-6 py-3 text-center shadow-md hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            <span>{t('bonus_card_button', 'Aktiválás')}</span>
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BonusCard;