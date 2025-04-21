import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SuccessAlert from "./SuccessAlert";
import ErrorAlert from "./ErrorAlert";
import axiosInstance from "../../utils/axios";

import {
  WalletMinimal,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  LogOut,
  Award,
  TrendingUp,
  ShieldUser,
} from "lucide-react";

const getCardStyles = (level) => {
  const tier = Math.min(Math.floor(level / 10), 10);

  // Alap stílus
  let styles = {
    cardContainer: `w-full sm:w-125 bg-gray-900 rounded-lg shadow-xl text-white relative overflow-hidden border border-gray-700/50 transition-all duration-500 ease-out`,
    levelCircleBorder: `absolute -inset-1 block rounded-full bg-gradient-to-br from-gray-600 to-gray-800 opacity-75 group-hover:opacity-90 transition-opacity duration-300`,
    levelCircleBg: `relative w-16 h-16 p-1 bg-gray-800 rounded-full flex items-center justify-center shadow-inner`,
    levelText: `font-black text-2xl text-gray-200 transition-colors duration-500`,
    xpBar: `bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full origin-left transition-all duration-500 ease-out`,
    profileHeader: `text-white`,
    balanceBg: `bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 group-hover:border-blue-500`,
    balanceIcon: `text-blue-400 group-hover:rotate-[-12deg]`,
  };

  if (tier >= 1) {
    // 10+ "Cyan Pulse"
    styles.cardContainer = `w-full sm:w-125 bg-gray-900 rounded-lg shadow-xl text-white relative overflow-hidden border-2 border-cyan-700 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-1 block rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-opacity-only`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-gray-800 rounded-full flex items-center justify-center shadow-inner`;
    styles.levelText = `font-black text-2xl text-cyan-300 transition-colors duration-500`;
    styles.xpBar = `bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full origin-left transition-all duration-500 ease-out`;
  }

  if (tier >= 2) {
    // 20+ "Purple Spin"
    styles.cardContainer = `w-full sm:w-125 bg-slate-900 rounded-lg shadow-xl text-white relative overflow-hidden border-2 border-purple-600 shadow-purple-500/20 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-1.5 block rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300 animate-spin-slow`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-slate-800 rounded-full flex items-center justify-center shadow-inner shadow-purple-500/30`;
    styles.levelText = `font-black text-3xl text-purple-300 transition-colors duration-500`;
    styles.xpBar = `bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.balanceBg = `bg-gradient-to-br from-slate-700 to-slate-800 border border-purple-600 group-hover:border-pink-500`;
    styles.balanceIcon = `text-purple-400 group-hover:rotate-[-12deg]`;
  }

  if (tier >= 3) {
    // 30+ "Indigo Sky"
    styles.cardContainer = `w-full sm:w-125 bg-gradient-to-br from-gray-900 to-indigo-900/70 rounded-lg shadow-xl text-white relative overflow-hidden border-2 border-indigo-500 shadow-indigo-500/30 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-1.5 block rounded-full bg-gradient-to-br from-indigo-400 via-sky-400 to-indigo-500 opacity-100 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-border`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-indigo-900/80 rounded-full flex items-center justify-center shadow-inner shadow-indigo-500/40`;
    styles.levelText = `font-black text-3xl text-indigo-200 transition-colors duration-500`;
    styles.xpBar = `bg-gradient-to-r from-indigo-400 to-sky-500 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.balanceBg = `bg-gradient-to-br from-slate-700 to-slate-800 border border-indigo-600 group-hover:border-indigo-500`;
    styles.balanceIcon = `text-indigo-400 group-hover:rotate-[-12deg]`;
  }

  if (tier >= 4) {
    // 40+ "Emerald Forest"
    styles.cardContainer = `w-full sm:w-125 bg-gradient-to-br from-gray-900 to-emerald-900/70 rounded-lg shadow-xl text-white relative overflow-hidden border-2 border-emerald-500 shadow-emerald-500/30 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-1.5 block rounded-full bg-gradient-to-br from-emerald-400 via-green-400 to-emerald-500 opacity-100 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-border-emerald`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-emerald-900/80 rounded-full flex items-center justify-center shadow-inner shadow-emerald-500/40`;
    styles.levelText = `font-black text-3xl text-emerald-200 transition-colors duration-500`;
    styles.xpBar = `bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.balanceBg = `bg-gradient-to-br from-gray-900/30 to-emerald-900 border-2 border-emerald-400 group-hover:border-blue-300`;
    styles.balanceIcon = `text-emerald-400 group-hover:rotate-[-12deg]`;
  }

  if (tier >= 5) {
    // 50+ "Glimmering Gold"
    styles.cardContainer = `w-full sm:w-125 bg-gradient-to-br from-neutral-900 to-amber-900/60 rounded-lg shadow-xl text-white relative overflow-hidden border-2 border-amber-500 shadow-amber-500/40 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-2 block rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 opacity-100 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-border-amber`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-gradient-to-br from-amber-800 to-amber-900 rounded-full flex items-center justify-center shadow-inner shadow-amber-400/50`;
    styles.levelText = `font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-300 transition-colors duration-500 text-shadow-sm-gold`;
    styles.xpBar = `bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.profileHeader = `text-amber-100`;
    styles.balanceBg = `bg-gradient-to-br from-yellow-900/30 to-amber-900 border-2 border-amber-400 group-hover:border-blue-300`;
    styles.balanceIcon = `text-amber-400 group-hover:rotate-[-12deg]`;
  }

  if (tier >= 6) {
    // 60+ "Electric Charge"
    styles.cardContainer = `w-full sm:w-125 bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900 rounded-lg shadow-2xl text-white relative overflow-hidden border-4 border-cyan-400 shadow-lg shadow-cyan-400/20 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-2 block rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 opacity-100 group-hover:opacity-100 transition-opacity duration-300 animate-aurora`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-gradient-to-br from-blue-950 to-indigo-950 rounded-full flex items-center justify-center shadow-inner shadow-cyan-400/30`;
    styles.levelText = `font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-300 drop-shadow-md`;
    styles.xpBar = `bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.profileHeader = `text-cyan-100 font-bold`;
    styles.balanceBg = `bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-cyan-500 group-hover:border-blue-300`;
    styles.balanceIcon = `text-cyan-300 group-hover:rotate-[-12deg] group-hover:scale-110 transition-transform`;
  }

  if (tier >= 7) {
    // 70+ "Cosmic Nebula"
    styles.cardContainer = `w-full sm:w-125 bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 rounded-lg shadow-2xl text-white relative overflow-hidden border-4 border-purple-400 shadow-lg shadow-purple-400/30 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-2 block rounded-full bg-gradient-to-br from-white via-purple-300 to-fuchsia-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300 animate-crystal-shine`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-gradient-to-br from-purple-950 to-slate-900 rounded-full flex items-center justify-center shadow-inner shadow-purple-400/50`;
    styles.levelText = `font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-300 drop-shadow-lg`;
    styles.xpBar = `bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.profileHeader = `text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 font-bold drop-shadow-sm`;
    styles.balanceBg = `bg-gradient-to-br from-purple-900 to-slate-900 border-2 border-fuchsia-500 group-hover:border-purple-300`;
    styles.balanceIcon = `text-purple-300 group-hover:rotate-[-14deg] group-hover:scale-110 transition-transform`;
  }

  if (tier >= 8) {
    // 80+ "Crimson Ember"
    styles.cardContainer = `w-full sm:w-125 bg-gradient-to-br from-gray-950 via-blue-950/30 to-gray-950 rounded-lg shadow-2xl text-white relative overflow-hidden border-2 border-cyan-500/80 shadow-lg shadow-cyan-500/30 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-2 block rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-fast`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-gray-950 rounded-full flex items-center justify-center shadow-inner shadow-cyan-500/40`;
    styles.levelText = `font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-lg`;
    styles.xpBar = `bg-gradient-to-r from-cyan-400 to-blue-600 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.profileHeader = `text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 font-bold drop-shadow-sm`;
    styles.balanceBg = `bg-gradient-to-br from-gray-900 to-blue-950 border border-cyan-500/70 group-hover:border-cyan-400`;
    styles.balanceIcon = `text-cyan-400 group-hover:rotate-[-14deg] group-hover:scale-110 transition-transform`;
  }

  if (tier >= 9) {
    // 80+ "Inferno Core"
    styles.cardContainer = `w-full sm:w-125 bg-gradient-to-br from-gray-950 via-red-950/50 to-gray-950 rounded-lg shadow-2xl text-white relative overflow-hidden border-2 border-orange-500 shadow-lg shadow-orange-500/30 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-2 block rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300 animate-lava-pulse`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-gradient-to-br from-gray-950 to-red-950 rounded-full flex items-center justify-center shadow-inner shadow-orange-500/40`;
    styles.levelText = `font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-lg`;
    styles.xpBar = `bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full origin-left transition-all duration-500 ease-out`;
    styles.profileHeader = `text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-yellow-200 font-bold drop-shadow-sm`;
    styles.balanceBg = `bg-gradient-to-br from-gray-900 to-red-950 border border-orange-500 group-hover:border-yellow-500`;
    styles.balanceIcon = `text-orange-400 group-hover:rotate-[-14deg] group-hover:scale-110 transition-transform`;
  }

  if (tier >= 10) {
    // 100 "Victory Gold"
    styles.cardContainer = `w-full sm:w-[500px] bg-gradient-to-br from-amber-700/60 via-yellow-600/50 to-amber-800/60 rounded-lg shadow-2xl text-gray-100 relative overflow-hidden border-2 border-amber-500 shadow-lg shadow-amber-500/30 transition-all duration-500 ease-out`;
    styles.levelCircleBorder = `absolute -inset-2 block rounded-full bg-gradient-to-br from-yellow-400 via-amber-600 to-yellow-300 opacity-90 group-hover:opacity-100 transition-opacity duration-300`;
    styles.levelCircleBg = `relative w-16 h-16 p-1 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-full flex items-center justify-center shadow-inner shadow-amber-900/50`;
    styles.levelText = `font-black text-4xl text-transparent bg-clip-text bg-gradient-to-br from-yellow-100 via-amber-200 to-yellow-300 drop-shadow-md`;
    styles.xpBar = `bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 h-full rounded-full origin-left transition-all duration-500 ease-out shadow-inner shadow-black/30`;
    styles.profileHeader = `text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-100 font-bold drop-shadow-lg`;
    styles.balanceBg = `bg-gradient-to-br from-amber-700/40 to-yellow-600/40 border border-amber-400 group-hover:border-yellow-300 rounded-lg shadow-md shadow-amber-900/30`;
    styles.balanceIcon = `text-amber-300 group-hover:text-amber-200 group-hover:rotate-[-10deg] group-hover:scale-105 transition-transform duration-300`;
  }
  return styles;
};

const UserCard = () => {
  const { t } = useTranslation();
  const { user, logout, updateWalletBalance } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardType, setCardType] = useState("");

  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState(null);
  const [depositSuccess, setDepositSuccess] = useState(null);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(null);

  const userLevel = Math.floor((user?.xp ?? 0) / 1000);
  const userXP = user?.xp ?? 0;
  const xpForNextLevel = (userLevel + 1) * 1000;
  const xpProgress = userLevel >= 100 ? 1 : (userXP % 1000) / 1000;

  const cardStyles = getCardStyles(userLevel);

  const neutralCardStyle = `w-full sm:w-125 bg-gray-900 rounded-lg shadow-xl text-white relative overflow-hidden border border-gray-700/50 transition-all duration-500 ease-out`;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  // Befizetés kezelése
  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositError(null);
    setDepositSuccess(null);
    setIsDepositing(true);

    // Basic frontend validation
    const amount = parseFloat(depositAmount);
    if (
      !amount ||
      amount <= 0 ||
      !cardHolderName ||
      !cardNumber ||
      !cardExpiry ||
      !cardCVV
    ) {
      setDepositError(
        t(
          "fill_all_card_details",
          "Please fill all card details and enter a valid amount."
        )
      );
      setIsDepositing(false);
      return;
    }

    if (!amount || amount < 3) {
      setDepositError(
        t("low_deposit_amount", "You need to deposit a minimum of $3.")
      );
      setIsDepositing(false);
      return;
    }

    // Clean card number (remove spaces)
    const cleanCardNumber = cardNumber.replace(/\s/g, "");

    try {
      const response = await axiosInstance.post("/payments/deposit", {
        amount: amount,
        cardnumber: cleanCardNumber,
        cvv: cardCVV,
        expireDate: cardExpiry,
      });

      // Successful deposit
      const updatedWallet = response.data.wallet;
      if (updateWalletBalance) {
        updateWalletBalance(updatedWallet.balance);
      }

      setDepositSuccess(
        t(
          "deposit_success_amount",
          `Successfully deposited ${formatCurrency(amount)}.`,
          { amount: formatCurrency(amount) }
        )
      );

      // Clear fields
      setDepositAmount("");
      setCardHolderName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCVV("");
      setShowCardDetails(false);
      setCardType("");
    } catch (error) {
      console.error("Deposit error:", error);
      // Error handling: try to read backend message
      const message =
        error.response?.data?.message ||
        t(
          "deposit_failed_generic",
          "Deposit failed. Please check details or try again later."
        );
      setDepositError(message);
    } finally {
      setIsDepositing(false);
    }
  };

  // UserCard.jsx - Withdraw handling function modification
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);
    setIsWithdrawing(true);

    const amount = parseFloat(withdrawAmount);
    const currentBalance = user?.walletBalance || 0;

    // Basic frontend validation
    if (!amount || amount <= 0) {
      setWithdrawError(
        t("invalid_withdraw_amount", "Please enter a valid amount.")
      );
      setIsWithdrawing(false);
      return;
    }

    if (amount > currentBalance) {
      setWithdrawError(t("insufficient_funds", "Insufficient funds."));
      setIsWithdrawing(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/payments/withdraw", {
        amount: amount,
      });

      // Successful withdrawal
      const updatedWallet = response.data.wallet;
      if (updateWalletBalance) {
        updateWalletBalance(updatedWallet.balance);
      }

      setWithdrawSuccess(
        t(
          "withdraw_success_amount",
          `Successfully withdrew ${formatCurrency(amount)}.`,
          { amount: formatCurrency(amount) }
        )
      );
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdraw error:", error);
      const message =
        error.response?.data?.message ||
        t(
          "withdraw_failed_generic",
          "Withdrawal failed. Please try again later."
        );
      setWithdrawError(message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Kártyaadatok mutatása/elrejtése
  const toggleCardDetails = () => {
    if (depositAmount && parseFloat(depositAmount) > 0) {
      setShowCardDetails(!showCardDetails);
    } else {
      alert(t("enter_deposit_amount_first"));
    }
  };

  // Pénznem formázása
  const formatCurrency = (amount) => {
    const numericAmount = amount ?? 0;
    return `$${numericAmount.toFixed(2)}`;
  };

  // Kártyaszám formázása
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const matches = cleaned.match(/(\d{1,4})/g);
    return matches ? matches.join(" ").slice(0, 19) : "";
  };

  // Lejárati dátum formázása
  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // CVV formázása
  const formatCVV = (value) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  // Kártyatípus felismerése
  const getCardType = (number) => {
    const cleanedNumber = number.replace(/\D/g, "");
    if (/^4/.test(cleanedNumber)) return "Visa";
    if (
      /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)/.test(
        cleanedNumber
      )
    )
      return "Mastercard";
    if (/^3[47]/.test(cleanedNumber)) return "American Express";
    return "";
  };

  // Kártyatípus beállítása
  useEffect(() => {
    const type = getCardType(cardNumber);
    setCardType(type);
  }, [cardNumber]);

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
      <ErrorAlert
        message={depositError || withdrawError}
        onClose={() => {
          setDepositError(null);
          setWithdrawError(null);
        }}
      />
      <SuccessAlert
        message={depositSuccess || withdrawSuccess}
        onClose={() => {
          setDepositSuccess(null);
          setWithdrawSuccess(null);
        }}
      />
      {/* Fő User Kártya */}
      <div
        className={
          activeTab === "profile" ? cardStyles.cardContainer : neutralCardStyle
        }
      >
        {/* Tabok */}
        <div className="border-b border-gray-700/80 bg-gray-800/60 backdrop-blur-sm">
          <nav className="flex justify-around">
            {["profile", "deposit", "withdraw"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-3 py-3 text-sm sm:text-base font-medium text-center transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-400/50 ${
                  activeTab === tab
                    ? "text-blue-300 border-b-2 border-blue-400 bg-gray-700/50"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/30 border-b-2 border-transparent"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== "deposit") {
                    setShowCardDetails(false);
                  }
                }}
              >
                {t(`${tab}_tab`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Tartalom */}
        <div className="p-5 sm:p-6">
          {/* Profile Tab Tartalma */}
          {activeTab === "profile" && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-5">
                <div className="relative mr-4 group shrink-0">
                  <span className={cardStyles.levelCircleBorder}></span>
                  <div className={cardStyles.levelCircleBg}>
                    <span className={cardStyles.levelText}>{userLevel}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <h2
                    className={`text-2xl sm:text-3xl font-bold tracking-tight truncate ${cardStyles.profileHeader}`}
                  >
                    {user.userName ? (
                      <div className="flex items-baseline space-x-1.5">
                        <span className="truncate">{user.userName}</span>
                        {user.role === "admin" && (
                          <span
                            title="admin"
                            className="inline-flex items-center text-lg sm:text-xl font-medium text-yellow-400 flex-shrink-0"
                          >
                            <ShieldUser
                              className="mr-1 h-5 w-5"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span>{t("guest_user")}</span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-400">{t("welcome_back")}</p>
                </div>
              </div>

              {/* Szint és XP Sáv */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-300">
                  <span className="flex items-center">
                    <Award className="w-4 h-4 mr-1.5 text-yellow-400" />
                    {t("level_prefix")}{" "}
                    <b className="ml-1 text-white">{userLevel}</b>
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-green-400" />
                    {userLevel >= 100
                      ? t("max_level_xp", "MAX XP")
                      : `${userXP.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`}
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className={cardStyles.xpBar}
                    style={{ transform: `scaleX(${xpProgress})` }}
                  ></div>
                </div>
              </div>

              {/* Egyenleg és Kijelentkezés */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/60">
                <div className="group relative">
                  <span
                    className={`relative flex items-center space-x-3 px-4 py-3 border rounded-lg shadow-md cursor-pointer transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 will-change-transform ${cardStyles.balanceBg}`}
                  >
                    <WalletMinimal
                      className={`w-7 h-7 transition-transform duration-300 ${cardStyles.balanceIcon}`}
                    />
                    <span className="text-lg font-semibold text-gray-100">
                      {formatCurrency(user?.walletBalance)}
                    </span>
                  </span>
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap will-change-opacity">
                    {t("current_balance")}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="group flex items-center p-2 text-red-500 hover:text-red-400 hover:bg-red-900/40 rounded-full transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 will-change-transform"
                  aria-label={t("logout_button_aria", "Logout")}
                >
                  <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {/* Deposit Tab Tartalma */}
          {activeTab === "deposit" && (
            <div className="animate-fade-in">
              {/* Deposit form ... */}
              <div className="flex items-center mb-5">
                <ArrowDownCircle className="w-7 h-7 text-green-400 mr-2.5" />
                <h2 className="text-xl font-semibold">
                  {t("deposit_title", "Deposit Funds")}
                </h2>
              </div>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label
                    htmlFor="depositAmount"
                    className="block text-sm font-medium mb-1.5 text-gray-300"
                  >
                    {t("deposit_amount_label", "Amount")}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      $
                    </span>
                    <input
                      id="depositAmount"
                      type="number"
                      className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder={t("deposit_amount_placeholder", "0.00")}
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        if (
                          showCardDetails &&
                          (!e.target.value || parseFloat(e.target.value) <= 0)
                        ) {
                          setShowCardDetails(false);
                        }
                      }}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-300">
                    {t("payment_method_label", "Payment Method")}
                  </label>
                  <div
                    className={`flex items-center p-3 bg-gray-800 border ${
                      !depositAmount || parseFloat(depositAmount) <= 0
                        ? "border-gray-700 opacity-50 cursor-not-allowed"
                        : "border-gray-600 cursor-pointer hover:bg-gray-700/60"
                    } rounded-md transition-opacity duration-200`}
                    onClick={
                      !depositAmount || parseFloat(depositAmount) <= 0
                        ? undefined
                        : toggleCardDetails
                    }
                  >
                    <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                    <span>{t("credit_debit_card", "Credit/Debit Card")}</span>
                    {!showCardDetails &&
                      depositAmount &&
                      parseFloat(depositAmount) > 0 && (
                        <svg
                          className="w-4 h-4 ml-auto text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      )}
                    {showCardDetails && (
                      <svg
                        className="w-4 h-4 ml-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                </div>
                {!showCardDetails && (
                  <button
                    type="button"
                    onClick={toggleCardDetails}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-md font-semibold text-white transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:opacity-90"
                  >
                    {t("continue_to_payment", "Continue")}
                  </button>
                )}
                <div className="text-center mt-4 pt-4 border-t border-gray-700/50">
                  <span className="text-sm text-gray-400">
                    {t("current_balance")}:{" "}
                  </span>
                  <span className="font-semibold text-white">
                    {formatCurrency(user?.walletBalance)}
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* Withdraw Tab Tartalma */}
          {activeTab === "withdraw" && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-5">
                <ArrowUpCircle className="w-7 h-7 text-blue-400 mr-2.5" />
                <h2 className="text-xl font-semibold">
                  {t("withdraw_title", "Withdraw Funds")}
                </h2>
              </div>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-300">
                    {t("available_balance", "Available Balance")}
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-800/70 border border-gray-700 rounded-md">
                    <WalletMinimal className="text-blue-300 w-6 h-6" />
                    <span className="text-lg font-semibold text-white">
                      {formatCurrency(user?.walletBalance)}
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="withdrawAmount"
                    className="block text-sm font-medium mb-1.5 text-gray-300"
                  >
                    {t("withdraw_amount_label", "Amount")}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      $
                    </span>
                    <input
                      id="withdrawAmount"
                      type="number"
                      className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder={t("withdraw_amount_placeholder", "0.00")}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="0.01"
                      max={user?.walletBalance || 0}
                      step="0.01"
                      required
                    />
                  </div>
                  {parseFloat(withdrawAmount) > (user?.walletBalance || 0) && (
                    <p className="text-xs text-red-400 mt-1">
                      {t("amount_exceeds_balance", "Amount exceeds balance")}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md font-semibold text-white transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:opacity-90"
                  disabled={
                    isWithdrawing ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0 ||
                    parseFloat(withdrawAmount) > (user?.walletBalance || 0)
                  }
                >
                  {isWithdrawing ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("processing", "Processing...")}
                    </span>
                  ) : (
                    t("withdraw_button", "Withdraw")
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Kártya Részletek Kártya */}
      {showCardDetails && activeTab === "deposit" && (
        <div className="w-full lg:w-96 bg-gray-900 rounded-lg shadow-xl text-white relative overflow-hidden border border-gray-700/50 animate-slide-in-left will-change-transform">
          <form onSubmit={handleDeposit} className="p-5 sm:p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {t("card_details_title", "Card Details")}
              </h3>
              <button
                type="button"
                onClick={() => setShowCardDetails(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Card Number */}
            <div>
              <label
                htmlFor="cardNumber_details"
                className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider"
              >
                {t("card_number_label", "Card Number")}
              </label>
              <div className="relative flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <input
                  id="cardNumber_details"
                  type="text"
                  inputMode="numeric"
                  className="flex-grow w-20 bg-transparent border-none text-base sm:text-lg font-mono text-white focus:outline-none placeholder-gray-500"
                  placeholder="---- ---- ---- ----"
                  value={formatCardNumber(cardNumber)}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength="19"
                  required
                />
                {cardType && (
                  <span className="text-gray-500 font-bold text-sm ml-2 whitespace-nowrap">
                    {cardType}
                  </span>
                )}
              </div>
            </div>
            {/* Cardholder Name */}
            <div>
              <label
                htmlFor="cardHolderName_details"
                className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider"
              >
                {t("cardholder_name_label", "Cardholder Name")}
              </label>
              <input
                id="cardHolderName_details"
                type="text"
                className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                placeholder={t("cardholder_name_placeholder", "JOHN DOE")}
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                maxLength="50"
                required
              />
            </div>
            {/* Expiry and CVV */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label
                  htmlFor="cardExpiry_details"
                  className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider"
                >
                  {t("expiry_date_label", "Expiry")}
                </label>
                <input
                  id="cardExpiry_details"
                  type="text"
                  inputMode="numeric"
                  className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  placeholder="MM/YY"
                  value={formatExpiryDate(cardExpiry)}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength="5"
                  required
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="cardCVV_details"
                  className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider"
                >
                  {t("cvv_label", "CVV")}
                </label>
                <input
                  id="cardCVV_details"
                  type="text"
                  inputMode="numeric"
                  className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  placeholder="•••"
                  value={formatCVV(cardCVV)}
                  onChange={(e) => setCardCVV(e.target.value)}
                  maxLength="4"
                  required
                />
              </div>
            </div>
            {/* Pay Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-md font-semibold text-white transition-opacity duration-300 disabled:opacity-50 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 hover:opacity-90"
              disabled={
                isDepositing ||
                !cardHolderName ||
                !cardNumber ||
                !cardExpiry ||
                !cardCVV ||
                !depositAmount ||
                parseFloat(depositAmount) <= 0
              }
            >
              {isDepositing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("processing", "Processing...")}
                </span>
              ) : (
                <>
                  {t("pay_now_button", "Pay Now")}{" "}
                  {depositAmount &&
                    `(${formatCurrency(parseFloat(depositAmount))})`}
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserCard;
