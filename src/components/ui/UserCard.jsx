import React, { useState } from "react";
import {
  CircleUser,
  WalletMinimal,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const UserCard = () => {
  const { user, logout, updateWalletBalance } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  const handleDeposit = (e) => {
    e.preventDefault();
    if (depositAmount && !isNaN(depositAmount)) {
      const newBalance = user.walletBalance + parseFloat(depositAmount);
      updateWalletBalance(newBalance);
      setDepositAmount("");
      setShowCardDetails(false);
      alert(`Successfully deposited $${depositAmount}`);
    }
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (
      withdrawAmount &&
      !isNaN(withdrawAmount) &&
      parseFloat(withdrawAmount) <= user.walletBalance
    ) {
      const newBalance = user.walletBalance - parseFloat(withdrawAmount);
      updateWalletBalance(newBalance);
      setWithdrawAmount("");
      alert(`Successfully withdrew $${withdrawAmount}`);
    } else if (parseFloat(withdrawAmount) > user.walletBalance) {
      alert("Insufficient funds");
    }
  };

  const toggleCardDetails = () => {
    setShowCardDetails(!showCardDetails);
  };

  return (
    <div className="flex">
      <div className="w-125 bg-gray-900 rounded-lg shadow-md text-white">
        <div className="border-b border-gray-800">
          <nav className="flex">
            <button
              className={`px-4 py-3 hover:text-gray-300 ${
                activeTab === "profile"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-white"
              }`}
              onClick={() => {
                setActiveTab("profile");
                setShowCardDetails(false);
              }}
            >
              Profile
            </button>
            <button
              className={`px-4 py-3 hover:text-gray-300 ${
                activeTab === "deposit"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-white"
              }`}
              onClick={() => setActiveTab("deposit")}
            >
              Deposit
            </button>
            <button
              className={`px-4 py-3 hover:text-gray-300 ${
                activeTab === "withdraw"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-white"
              }`}
              onClick={() => {
                setActiveTab("withdraw");
                setShowCardDetails(false);
              }}
            >
              Withdraw
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mr-3 text-white">
                  <CircleUser className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold">{user.userName}</h2>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-base font-medium">LVL. 1</span>
                  <span className="text-sm text-white">5000xp</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-2">
                <span className="relative flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-br from-green-400 to-blue-600 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
                  <WalletMinimal className="text-white w-8 h-8" />
                  <span className="text-lg font-semibold text-gray-100">
                    <b>{user?.walletBalance}$</b>
                  </span>
                </span>

                <button onClick={handleLogout} className="flex p-2 text-red-400 transition-transform duration-300 hover:scale-110">
                  <LogOut />
                </button>
              </div>
            </>
          )}

          {activeTab === "deposit" && (
            <div>
              <div className="flex items-center mb-6">
                <ArrowDownCircle className="w-8 h-8 text-green-400 mr-2" />
                <h2 className="text-xl font-bold">Deposit</h2>
              </div>

              <form onSubmit={handleDeposit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Amount to Deposit
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      className="w-full pl-8 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Payment Method
                  </label>
                  <div
                    className="flex items-center p-3 bg-gray-800 border border-gray-700 rounded-md mb-3 cursor-pointer hover:bg-gray-700"
                    onClick={toggleCardDetails}
                  >
                    <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                    <span>Credit/Debit Card</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-green-400 rounded-md font-medium transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right"
                >
                  Deposit Now
                </button>

                <div className="mt-4 text-sm text-gray-400 text-center">
                  <div className="flex items-center">
                    <span className="relative flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-br from-cyan-500 to-green-400 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
                      <WalletMinimal className="text-white w-8 h-8" />
                      <span className="text-lg font-semibold text-gray-100">
                        <b>{user?.walletBalance}$</b>
                      </span>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "withdraw" && (
            <div>
              <div className="flex items-center mb-6">
                <ArrowUpCircle className="w-8 h-8 text-blue-400 mr-2" />
                <h2 className="text-xl font-bold">Withdraw</h2>
              </div>

              <form onSubmit={handleWithdraw}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Available Balance
                  </label>
                  <div className="flex items-center">
                    <span className="relative flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right">
                      <WalletMinimal className="text-white w-8 h-8" />
                      <span className="text-lg font-semibold text-gray-100">
                        <b>{user?.walletBalance}$</b>
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      className="w-full pl-8 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="0"
                      max={user?.walletBalance}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md font-medium transition-all duration-500 ease-in-out bg-[length:200%_200%] bg-left hover:bg-right"
                  disabled={
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) > user?.walletBalance
                  }
                >
                  Withdraw Now
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {showCardDetails && (
        <div className="w-96 ml-4 bg-gray-900 rounded-lg shadow-md text-white">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-6">Enter Card Details</h3>

            <div className="mb-6 bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-grow bg-transparent border-none text-lg font-mono text-white focus:outline-none"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength="19"
                />
                <span className="text-white font-bold text-lg ml-2">VISA</span>
              </div>
            </div>
            <label className="block text-sm font-medium mb-2">
              Cardholder Name
            </label>
            <div className="mb-6 bg-gray-800 rounded-lg p-4">
              <input
                type="text"
                className="w-full h-5 bg-transparent border-none text-medium font-mono text-white focus:outline-none"
                placeholder="John Doe"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                maxLength="30"
              />
            </div>
            <div className="flex space-x-4 mb-6">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength="5"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-2">CVV</label>
                <input
                  type="text"
                  className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-md"
                  placeholder="123"
                  value={cardCVV}
                  onChange={(e) => setCardCVV(e.target.value)}
                  maxLength="3"
                />
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
              onClick={handleDeposit}
            >
              Pay now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
