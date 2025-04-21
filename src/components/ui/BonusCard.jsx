import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { Gift, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';

const COOLDOWN_PERIOD_MS = 24 * 60 * 60 * 1000; 

const formatTimeLeft = (milliseconds) => {
  if (milliseconds <= 0) {
    return "00:00:00";
  }
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const calculateBonusAmount = (userXp) => {
  if (!userXp || isNaN(userXp)) 
    return 2; 
  
  const baseBonus = 2;
  if (userXp > 100000) return baseBonus + 10;
  else if (userXp >= 90000) return baseBonus + 9;
  else if (userXp >= 80000) return baseBonus + 8;
  else if (userXp >= 70000) return baseBonus + 7;
  else if (userXp >= 60000) return baseBonus + 6;
  else if (userXp >= 50000) return baseBonus + 5;
  else if (userXp >= 40000) return baseBonus + 4;
  else if (userXp >= 30000) return baseBonus + 3;
  else if (userXp >= 20000) return baseBonus + 2;
  else if (userXp >= 10000) return baseBonus + 1;
  else if (userXp <= 1000) return baseBonus;
  
  return baseBonus;
}

const BonusCard = () => {
  const { t } = useTranslation();
  const { user, updateBonusClaimStatus, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(calculateBonusAmount(user?.xp));

  const lastClaimTime = user?.dailyBonusClaimed;

  const nextAvailableTime = useMemo(() => {
    if (!lastClaimTime) return null;
    try {
      const claimedDate = new Date(lastClaimTime);
      if (isNaN(claimedDate.getTime())) {
          console.error("Invalid lastClaimTime:", lastClaimTime);
          return null;
      }
      return claimedDate.getTime() + COOLDOWN_PERIOD_MS;
    } catch (e) {
      console.error("Error parsing lastClaimTime:", e);
      return null;
    }
  }, [lastClaimTime]);

  useEffect(() => {
    if (user && user.xp !== undefined) {
      setBonusAmount(calculateBonusAmount(user.xp));
    }
  }, [user]);

  useEffect(() => {
    setError(null);
    setSuccessMessage(null);

    if (!nextAvailableTime) {
      setTimeLeft(0);
      return;
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const remaining = nextAvailableTime - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
      return remaining;
    };

    const initialRemaining = calculateRemaining();

    if (initialRemaining <= 0) {
       return;
    }

    const intervalId = setInterval(() => {
      const remaining = calculateRemaining();
      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);

  }, [nextAvailableTime]);


  const handleClaimBonus = async () => {
    if (!isAuthenticated || isLoading || (timeLeft !== null && timeLeft > 0)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axiosInstance.post('/bonus/claimdaily');
      const newBalance = response.data.balance;
      const claimTime = new Date().toISOString();

      updateBonusClaimStatus(newBalance, claimTime);

      setSuccessMessage(response.data.message || t('bonus_claim_success_default', 'Bónusz sikeresen igényelve!'));

    } catch (err) {
      const errorMessage = err.response?.data?.message || t('error_bonus_claim_failed', 'Hiba történt a bónusz igénylése közben.');
      setError(errorMessage);
      console.error("Claim bonus error:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  const canClaim = isAuthenticated && !isLoading && (timeLeft !== null && timeLeft <= 0);

  return (
    <div className="group relative w-full max-w-sm md:max-w-md rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 ease-in-out hover:scale-[1.03]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-red-600 z-0"></div>
       <Gift
        size={220}
        className="absolute -bottom-8 -right-8 sm:-bottom-12 sm:-right-12 text-white/20 z-[3] transform rotate-[25deg] transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-105"
        strokeWidth={1}
      />
      <div className="bonus-card-shine absolute inset-0 z-[4]"></div>

      <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[220px]">
        <div>
          <h5 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight text-shadow">
            {t('bonus_card_head', 'Napi Bónusz!')}
          </h5>
          <p className="text-base text-gray-200 mb-4 leading-relaxed">
            {(timeLeft !== null && timeLeft > 0)
              ? t('bonus_card_text_cooldown')
              : t('bonus_card_text', { amount: bonusAmount })
            }
          </p>
          {error && !isLoading && <p className="text-red-300 text-sm mb-3">{error}</p>}
          {successMessage && !isLoading && <p className="text-green-300 text-sm mb-3">{successMessage}</p>}
        </div>

        <div className="flex justify-start mt-auto items-center">
          {(timeLeft !== null && timeLeft > 0 && !isLoading) ? (
             <div className="flex items-center space-x-2 text-yellow-300 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg font-mono text-lg">
                <Clock size={20} />
                <span>{formatTimeLeft(timeLeft)}</span>
             </div>
          ) : (
            <button
              type="button"
              onClick={handleClaimBonus}
              disabled={!canClaim || isLoading}
              className={`inline-flex items-center space-x-2 text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-semibold rounded-lg text-sm px-6 py-3 text-center shadow-md hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 ${(!canClaim || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading
                ? <span>{t('bonus_card_button_loading')}</span>
                : <span>{t('bonus_card_button')}</span>
              }
              {!isLoading && <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BonusCard;