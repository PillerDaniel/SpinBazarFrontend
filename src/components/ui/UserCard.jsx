import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  CircleUser,
  WalletMinimal,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  LogOut,
  Award,
  TrendingUp,
} from "lucide-react";

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userLevel = Math.floor((user?.xp ?? 0) / 1000);
  const userXP = user?.xp ?? 0;
  const xpForNextLevel = userLevel * 1000 + 1000; 
  const xpProgress = (userXP % 1000) / 1000;

  if (!user) {
    return null;
  }

  const handleDeposit = (e) => {
    e.preventDefault();
    if (depositAmount && !isNaN(depositAmount) && parseFloat(depositAmount) > 0 && cardHolderName && cardNumber && cardExpiry && cardCVV) {
      const newBalance = (user.walletBalance || 0) + parseFloat(depositAmount);
      updateWalletBalance(newBalance);
      alert(`${t("deposit_success")} ${formatCurrency(parseFloat(depositAmount))}`);
      setDepositAmount("");
      setCardHolderName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCVV("");
      setShowCardDetails(false);
      setCardType("");
    } else if (!cardHolderName || !cardNumber || !cardExpiry || !cardCVV) {
      alert(t("fill_all_card_details"));
    } else {
      alert(t("invalid_deposit_amount"));
    }
  };


  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    const currentBalance = user.walletBalance || 0;

    if (withdrawAmount && !isNaN(amount) && amount > 0) {
      if (amount <= currentBalance) {
        const newBalance = currentBalance - amount;
        updateWalletBalance(newBalance);
        setWithdrawAmount("");
        alert(`${t("withdraw_success")} ${formatCurrency(amount)}`);
      } else {
        alert(t("insufficient_funds"));
      }
    } else {
      alert(t("invalid_withdraw_amount"));
    }
  };

  const toggleCardDetails = () => {
    if (depositAmount && parseFloat(depositAmount) > 0) {
      setShowCardDetails(!showCardDetails);
    } else {
      alert(t("enter_deposit_amount_first"));
    }
  };

  const formatCurrency = (amount) => {
    const numericAmount = amount ?? 0;
    return `$${numericAmount.toFixed(2)}`;
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const matches = cleaned.match(/(\d{1,4})/g);
    return matches ? matches.join(' ').slice(0, 19) : '';
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const getCardType = (number) => {
    const cleanedNumber = number.replace(/\D/g, '');

    if (/^4/.test(cleanedNumber)) return 'Visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)/.test(cleanedNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanedNumber)) return 'American Express';
    if (/^6(011|4[4-9]|5)/.test(cleanedNumber)) return 'Discover';
    if (/^3(0[0-5]|[689])/.test(cleanedNumber)) return 'Diners Club';
    if (/^35(2[89]|[3-8]\d)/.test(cleanedNumber)) return 'JCB';
    return '';
  };

  useEffect(() => {
    const type = getCardType(cardNumber);
    setCardType(type);
  }, [cardNumber]);

  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Fő User Kártya */}
      <div
        className="w-full sm:w-125 bg-gray-900 rounded-lg shadow-xl text-white relative overflow-hidden border border-gray-700/50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='gradient1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='rgba(31, 41, 55, 0.7)'/%3E%3Cstop offset='100%25' stop-color='rgba(55, 65, 82, 0.9)'/%3E%3C/linearGradient%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' fill='url(%23gradient1)'/%3E%3Crect width='200' height='200' filter='url(%23noiseFilter)' opacity='0.05' /%3E%3C/defs%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Tabok */}
        <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <nav className="flex justify-around">
            {["profile", "deposit", "withdraw"].map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-3 py-3 text-sm sm:text-base font-medium text-center transition-colors duration-200 ease-in-out ${
                  activeTab === tab
                    ? "text-blue-400 border-b-2 border-blue-400 bg-gray-700/30"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/20 border-b-2 border-transparent"
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

        <div className="p-5 sm:p-6">
          {/* Profile Tab Tartalma */}
          {activeTab === "profile" && (
            <div className="animate-fade-in">
              {/* Felhasználó és Avatar */}
              <div className="flex items-center mb-5">
                 <div className="relative mr-4 group">
                   <span className="absolute -inset-0.5 block rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-opacity-only"></span>
                   <div className="relative w-16 h-16 p-1 bg-gray-800 rounded-full flex items-center justify-center ">
                      <CircleUser className="w-14 h-14 text-gray-400" />
                   </div>
                 </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {user.userName || t("guest_user")}
                    </h2>
                    <p className="text-sm text-gray-400">{t('welcome_back')}</p>
                </div>
              </div>

              {/* Szint és XP Sáv */}
              <div className="mb-6 space-y-2">
                 <div className="flex justify-between items-center text-sm font-medium text-gray-300">
                   <span className="flex items-center">
                      <Award className="w-4 h-4 mr-1.5 text-yellow-400" />
                      {t("level_prefix")} <b className="ml-1 text-white">{userLevel}</b>
                   </span>
                   <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1.5 text-green-400" />
                       {userXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                   </span>
                 </div>
                 <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                   <div
                     className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full origin-left transition-transform duration-500 ease-out"
                     style={{ transform: `scaleX(${xpProgress})` }}
                   ></div>
                 </div>
              </div>

              {/* Egyenleg és Kijelentkezés */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
                 <div className="group relative">
                   <span className="relative flex items-center space-x-3 px-4 py-3 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-lg shadow-md cursor-pointer transition-transform duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:border-blue-500 will-change-transform">
                      <WalletMinimal className="text-blue-400 w-7 h-7 transition-transform duration-300 group-hover:rotate-[-12deg]" />
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
                   className="group flex items-center p-2 text-red-500 hover:text-red-400 hover:bg-red-900/30 rounded-full transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 will-change-transform"
                   aria-label={t('logout_button_aria')}
                 >
                   <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                 </button>
              </div>
            </div>
          )}

          {/* Deposit Tab Tartalma */}
          {activeTab === "deposit" && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-5">
                <ArrowDownCircle className="w-7 h-7 text-green-400 mr-2.5" />
                <h2 className="text-xl font-semibold">{t("deposit_title")}</h2>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label htmlFor="depositAmount" className="block text-sm font-medium mb-1.5 text-gray-300">
                    {t("deposit_amount_label")}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                    <input
                      id="depositAmount" type="number"
                      className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder={t("deposit_amount_placeholder")} value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        if (showCardDetails && (!e.target.value || parseFloat(e.target.value) <= 0)) { setShowCardDetails(false); }
                      }}
                      min="0.01" step="0.01" required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-300">
                    {t("payment_method_label")}
                  </label>
                  <div
                    className={`flex items-center p-3 bg-gray-800 border ${!depositAmount || parseFloat(depositAmount) <= 0 ? 'border-gray-700 opacity-50 cursor-not-allowed' : 'border-gray-600 cursor-pointer hover:bg-gray-700/60'} rounded-md transition-opacity duration-200`}
                    onClick={(!depositAmount || parseFloat(depositAmount) <= 0) ? undefined : toggleCardDetails}
                  >
                    <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                    <span>{t("credit_debit_card")}</span>
                    {!showCardDetails && depositAmount && parseFloat(depositAmount) > 0 && (
                      <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    )}
                    {showCardDetails && (
                        <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                    )}
                  </div>
                </div>

                {!showCardDetails && (
                    <button
                      type="button" onClick={toggleCardDetails} disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-md font-semibold text-white transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:opacity-90"
                    >
                      {t("continue_to_payment")}
                    </button>
                  )}

                <div className="text-center mt-4 pt-4 border-t border-gray-700/50">
                  <span className="text-sm text-gray-400">{t("current_balance")}: </span>
                  <span className="font-semibold text-white">{formatCurrency(user?.walletBalance)}</span>
                </div>
              </form>
            </div>
          )}

          {/* Withdraw Tab Tartalma */}
          {activeTab === "withdraw" && (
            <div className="animate-fade-in">
                <div className="flex items-center mb-5">
                  <ArrowUpCircle className="w-7 h-7 text-blue-400 mr-2.5" />
                  <h2 className="text-xl font-semibold">{t("withdraw_title")}</h2>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-300">{t("available_balance")}</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-800/70 border border-gray-700 rounded-md">
                        <WalletMinimal className="text-blue-300 w-6 h-6" />
                        <span className="text-lg font-semibold text-white">{formatCurrency(user?.walletBalance)}</span>
                      </div>
                  </div>

                  <div>
                      <label htmlFor="withdrawAmount" className="block text-sm font-medium mb-1.5 text-gray-300">{t("withdraw_amount_label")}</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                        <input
                            id="withdrawAmount" type="number"
                            className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                            placeholder={t("withdraw_amount_placeholder")} value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            min="0.01" max={user?.walletBalance || 0} step="0.01" required
                        />
                      </div>
                       {parseFloat(withdrawAmount) > (user?.walletBalance || 0) && (<p className="text-xs text-red-400 mt-1">{t("amount_exceeds_balance")}</p>)}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md font-semibold text-white transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:opacity-90"
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (user?.walletBalance || 0)}
                  >
                    {t("withdraw_button")}
                  </button>
                </form>
            </div>
          )}
        </div>
      </div>

      {/* Kártya Részletek Kártya */}
      {showCardDetails && activeTab === 'deposit' && (
        <div
          className="w-full sm:w-96 bg-gray-900 rounded-lg shadow-xl text-white relative overflow-hidden border border-gray-700/50 animate-slide-in-left will-change-transform"
        >
          <form onSubmit={handleDeposit} className="p-6 space-y-5">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t("card_details_title")}</h3>
                <button type="button" onClick={() => setShowCardDetails(false)} className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Kártyaszám */}
            <div>
                <label htmlFor="cardNumber_details" className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider">{t("card_number_label")}</label>
                <div className="relative flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <input
                    id="cardNumber_details" type="text" inputMode="numeric"
                    className="flex-grow w-20 bg-transparent border-none text-base sm:text-lg font-mono text-white focus:outline-none placeholder-gray-500"
                    placeholder="---- ---- ---- ----" value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength="19" required
                  />
                  {cardType && (
                     <span className="text-gray-500 font-bold text-sm ml-2 whitespace-nowrap">
                       {cardType}
                     </span>
                   )}
                </div>
            </div>

            {/* Kártyabirtokos neve */}
            <div>
                <label htmlFor="cardHolderName_details" className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider">{t("cardholder_name_label")}</label>
                <input
                  id="cardHolderName_details" type="text"
                  className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  placeholder={t("cardholder_name_placeholder")} value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  maxLength="50" required
                />
            </div>

            {/* Lejárat és CVV */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="cardExpiry_details" className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider">{t("expiry_date_label")}</label>
                <input
                  id="cardExpiry_details" type="text" inputMode="numeric"
                  className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  placeholder="MM/YY" value={formatExpiryDate(cardExpiry)}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength="5" required
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="cardCVV_details" className="block text-xs font-medium mb-1 text-gray-400 uppercase tracking-wider">{t("cvv_label")}</label>
                <input
                  id="cardCVV_details" type="text" inputMode="numeric"
                  className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  placeholder="•••" value={formatCVV(cardCVV)}
                  onChange={(e) => setCardCVV(e.target.value)}
                  maxLength="4" required
                />
              </div>
            </div>

            {/* Befizetés Gomb */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-md font-semibold text-white transition-opacity duration-300 disabled:opacity-50 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 hover:opacity-90"
              disabled={!cardHolderName || !cardNumber || !cardExpiry || !cardCVV || !depositAmount || parseFloat(depositAmount) <= 0 }
            >
              {t("pay_now_button")} {depositAmount && `(${formatCurrency(parseFloat(depositAmount))})`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserCard;