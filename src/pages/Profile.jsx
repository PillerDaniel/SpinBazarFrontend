import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Clock,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  User,
  Calendar,
  Mail,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/ui/Navbar";
import ErrorAlert from "../components/ui/ErrorAlert";
import SuccessAlert from "../components/ui/SuccessAlert";
import Footer from "../components/ui/Footer";
import axiosInstance from "../utils/axios";

const Profile = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);

  const TRANSACTIONS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordEmail, setCurrentPasswordEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [showCurrentPasswordEmail, setShowCurrentPasswordEmail] =
    useState(false);

  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [currentPasswordDeactivate, setCurrentPasswordDeactivate] =
    useState("");

  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showCurrentPasswordDeactivate, setShowCurrentPasswordDeactivate] =
    useState(false);

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const indexOfLastTransaction = currentPage * TRANSACTIONS_PER_PAGE;
  const indexOfFirstTransaction =
    indexOfLastTransaction - TRANSACTIONS_PER_PAGE;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE);

  const language = localStorage.getItem("i18nextLng");
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        const isAdminMode = window.location.pathname.includes('/admin/userprofile/');
        let response;
        
        if (isAdminMode) {
          const userId = window.location.pathname.split('/').pop();
          
          response = await axiosInstance.get(`/admin/userprofile/${userId}`);
          const {
            userName,
            email,
            createdAt,
            birthDate,
            isActive,
            role,
            wallet,
            lastLogin,
          } = response.data.user;
          
          const activeDays = Math.floor(
            (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
          );
          
          const fetchedUserDetails = {
            userName: userName || "User",
            email: email,
            createdAt: createdAt,
            birthDate: birthDate,
            isActive: isActive,
            role: role || "user",
            walletBalance: wallet?.balance || 0,
            stats: {
              daysActive: activeDays,
              lastLogin: lastLogin,
              totalTransactions: response.data.transactions?.length || 0,
            },
          };
          
          setUserDetails(fetchedUserDetails);
          setNewEmail(fetchedUserDetails.email);
          
          const fetchedTransactions = response.data.transactions || [];
          
          fetchedTransactions.sort((a, b) => {
            const dateA = new Date(a.completedAt || a.createdAt);
            const dateB = new Date(b.completedAt || b.createdAt);
            return dateB - dateA;
          });
          
          setTransactions(fetchedTransactions);
        } else {
          response = await axiosInstance.get("/user/account");
          const {
            userName,
            email,
            createdAt,
            birthDate,
            isActive,
            role,
            wallet,
            lastLogin,
          } = response.data.userData;
          const activeDays = Math.floor(
            (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
          );
          const fetchedUserDetails = {
            userName: userName || "User",
            email: email,
            createdAt: createdAt,
            birthDate: birthDate,
            isActive: isActive,
            role: role || "user",
            walletBalance: wallet?.balance || 0,
            stats: {
              daysActive: activeDays,
              lastLogin: lastLogin,
              totalTransactions: 24,
            },
          };
          setUserDetails(fetchedUserDetails);
  
          setNewEmail(fetchedUserDetails.email);
  
          const fetchedTransactions = response.data.transactions || [];
  
          fetchedTransactions.sort((a, b) => {
            const dateA = new Date(a.completedAt);
            const dateB = new Date(b.completedAt);
            return dateB - dateA;
          });
          
          setTransactions(fetchedTransactions);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [logout]);

  const handleLogout = () => {
    logout();
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isAdminMode = () => {
    return window.location.pathname.includes('/admin/userprofile/');
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();

    if (isAdminMode()) {
      setErrorMessage(t("action_not_available_in_admin_mode"));
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPasswordEmail) {
      setErrorMessage(t("error_password_required"));
      return;
    }
    setIsUpdatingEmail(true);
    try {
      const response = await axiosInstance.put("/user/changeemail", {
        newEmail: newEmail,
        password: currentPasswordEmail,
      });

      if(language === "hu"){
        setSuccessMessage(response.data.messageHU);
      }
      else{
        setSuccessMessage(response.data.message);
      }
      setUserDetails((prevDetails) => ({ ...prevDetails, email: newEmail }));
      setCurrentPasswordEmail("");
      setShowCurrentPasswordEmail(false);
    } catch (error) {
      console.error("Error updating email:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        t("error_server_generic");
      setErrorMessage(t(errorMsg));
      setCurrentPasswordEmail("");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (isAdminMode()) {
      setErrorMessage(t("action_not_available_in_admin_mode"));
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(t("error_passwords_do_not_match"));
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setErrorMessage(t("error_password_requirements_not_met"));
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await axiosInstance.put("/user/changepassword", {
        oldPassword: oldPassword,
        newPassword: newPassword,
        newPasswordConfirmation: confirmNewPassword,
      });
      if (language === "hu"){
        setSuccessMessage(response.data.messageHU);
      }else{
        setSuccessMessage(response.data.message);
      }
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordChangeForm(false);
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        t("error_server_generic");
      setErrorMessage(t(errorMsg));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivateAccount = async (e) => {
    e.preventDefault();

    if (isAdminMode()) {
      setErrorMessage(t("action_not_available_in_admin_mode"));
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPasswordDeactivate) {
      setErrorMessage(t("error_password_required_deactivate"));
      return;
    }
    setIsDeactivating(true);
    try {
      const response = await axiosInstance.put("/user/deactivate", {
        password: currentPasswordDeactivate,
      });
      if (language === "hu"){
        setSuccessMessage(response.data.messageHU);
      }
      else{
        setSuccessMessage(response.data.message);
      }
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error) {
      console.error("Error deactivating account:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        t("error_server_generic");
      setErrorMessage(t(errorMsg));
      setCurrentPasswordDeactivate("");
      setIsDeactivating(false);
    }
  };

  if (loading && !userDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">{t("loading_message")}</p>
        </div>
      </div>
    );
  }

  if (!userDetails && !loading) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex flex-col">
        <Navbar />

        {isAdminMode() && (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 mt-16">
    <button 
      onClick={() => window.history.back()} 
      className="flex items-center text-blue-400 hover:text-blue-300"
    >
      <ChevronLeft size={20} />
      <span>{t("back_to_admin_dashboard")}</span>
    </button>
    <div className="bg-blue-900 text-white p-3 rounded-md mt-2 mb-2">
      <p className="font-medium">{t("admin_mode_viewing_user_profile")}</p>
    </div>
  </div>
)}

        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-6 bg-gray-900 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-red-500">
              {t("error_fetch_user_title")}
            </h2>{" "}
            <p className="text-gray-400 mb-4">
              {t("error_fetch_user_message")}
            </p>{" "}
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              {t("sign_out")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {" "}
      <Navbar />
      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <ErrorAlert
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 mb-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-900 rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl mb-4">
                  <b>{userDetails?.userName?.charAt(0).toUpperCase()}</b>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {userDetails?.userName}
                </h2>
                <p className="text-gray-200 text-sm">{userDetails?.email}</p>
                <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {t(
                    userDetails?.role?.charAt(0).toUpperCase() +
                      userDetails?.role?.slice(1) || "User"
                  )}{" "}
                </div>
              </div>

              <ul className="space-y-2">
                <li>
                  <button
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${
                      activeTab === "overview"
                        ? "bg-gray-700 text-white"
                        : "text-white hover:bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <User size={18} />
                    <span>{t("profile_overview")}</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${
                      activeTab === "wallet"
                        ? "bg-gray-700 text-white"
                        : "text-white hover:bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("wallet")}
                  >
                    <CreditCard size={18} />
                    <span>{t("profile_wallet")}</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${
                      activeTab === "settings"
                        ? "bg-gray-700 text-white"
                        : "text-white hover:bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings size={18} />
                    <span>{t("profile_settings")}</span>
                  </button>
                </li>
              </ul>

              {!isAdminMode() && (
            <div className="mt-6 pt-6 border-t border-gray-700"> 
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-3 py-2 text-red-400 hover:bg-red-900/50 rounded-md transition-colors duration-150"
              >
                <LogOut size={18} />
                <span>{t("sign_out")}</span>
              </button>
            </div>
          )}
            </div>

            {isAdminMode() ? (
            <div className="bg-yellow-600 rounded-lg shadow p-4 text-black">
              <h3 className="font-semibold flex items-center text-sm">
                <Eye size={16} className="mr-2 flex-shrink-0" />
                {t("admin_spectator_mode_title")}
              </h3>
              <p className="mt-2 text-xs text-yellow-900">
                {t("admin_spectator_mode_desc")}
              </p>
            </div>
          ) : (
            <div className="bg-blue-700 rounded-lg shadow p-4 text-white">
              <h3 className="font-medium flex items-center">
                <HelpCircle size={16} className="mr-2" />
                {t("help_needed")}
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                {t("help_description")}
              </p>
              <button className="mt-3 w-full bg-white text-blue-700 rounded-md py-2 text-sm font-medium hover:bg-gray-100">
                {t("contact_support")}
              </button>
            </div>
          )}
          </div>

          <div className="flex-1">
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-900 rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm">
                          {t("current_balance")}
                        </p>
                        <h3 className="text-2xl font-bold text-white">
                          {formatCurrency(userDetails?.walletBalance)}
                        </h3>
                      </div>
                      <div className="p-2 bg-green-500 rounded-md">
                        <CreditCard size={20} className="text-green-100" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm">
                          {t("member_since")}
                        </p>
                        <h3 className="text-xl font-bold text-white">
                          {formatDate(userDetails?.createdAt)}
                        </h3>
                      </div>
                      <div className="p-2 bg-blue-500 rounded-md">
                        <Clock size={20} className="text-blue-100" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white">
                      {userDetails?.stats.daysActive} {t("days_active")}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm">
                          {t("account_status")}
                        </p>
                        <h3 className="text-xl font-bold flex items-center text-white">
                          {userDetails?.isActive ? (
                            <>
                              <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
                              {t("status_active")}
                            </>
                          ) : (
                            <>
                              <span className="bg-red-500 w-2 h-2 rounded-full mr-2"></span>
                              {t("status_inactive")}
                            </>
                          )}
                        </h3>
                      </div>
                      <div className="p-2 bg-purple-500 rounded-md">
                        <Shield size={20} className="text-purple-100" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg shadow">
                  <div className="px-6 py-4 bg-gray-900">
                    <h2 className="text-lg font-medium text-white">
                      {t("personal_info")}
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <User size={28} className="mr-2 text-white" />
                          {t("username")}
                        </h3>
                        <p className="mt-1 text-xl text-white">
                          {userDetails?.userName}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <Mail size={28} className="mr-2" />
                          {t("email_address")}
                        </h3>
                        <p className="mt-1 text-xl text-white">
                          {userDetails?.email}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <Calendar size={28} className="mr-2" />
                          {t("birth_date")}
                        </h3>
                        <p className="mt-1 text-white">
                          {formatDate(userDetails?.birthDate)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center">
                          <Shield size={28} className="mr-2 text-yellow-400" />
                          {t("role")}
                        </h3>
                        <p className="mt-1 text-xl text-white">
                          {userDetails?.role.charAt(0).toUpperCase() +
                            userDetails?.role.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="p-6 space-y-6">
                <div className="bg-gray-800 rounded-lg shadow p-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {t("profile_wallet")}
                      </h2>
                    </div>
                    <div className="mt-3 sm:mt-0 text-right">
                      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                        {" "}
                        {t("current_balance")}
                      </p>
                      <div className="text-2xl font-semibold text-white">
                        {formatCurrency(userDetails?.walletBalance)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">
                      {t("recent_transactions")}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            {t("transaction_type")}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            {t("transaction_amount")}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            {t("transaction_date")}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            {t("transaction_status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {currentTransactions.length > 0 ? (
                          currentTransactions.map((transaction) => (
                            <tr
                              key={transaction._id}
                              className="hover:bg-gray-700 transition-colors duration-150"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                <div className="flex items-center">
                                  <div
                                    className={`p-1.5 rounded-md mr-3 ${
                                      transaction.transactionType === "deposit"
                                        ? "bg-green-500/50 text-green-300"
                                        : transaction.transactionType === "withdraw"
                                        ? "bg-red-500/50 text-red-300"
                                        : "bg-gray-600/30 text-gray-300" 
                                    }`}
                                  >
                                    <RefreshCw size={14} />
                                  </div>
                                  <span className="font-medium capitalize">
                                    {t(
                                      `transaction_type_${transaction.transactionType}`,
                                      transaction.transactionType
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`font-medium ${
                                    transaction.transactionType === "deposit" ||
                                    transaction.transactionType === "bet_win"
                                      ? "text-green-400"
                                      : transaction.transactionType ===
                                          "withdraw" ||
                                        transaction.transactionType ===
                                          "bet_place"
                                      ? "text-red-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {transaction.transactionType === "deposit" ||
                                  transaction.transactionType === "bet_win"
                                    ? "+"
                                    : transaction.transactionType ===
                                        "withdraw" ||
                                      transaction.transactionType ===
                                        "bet_place"
                                    ? "-"
                                    : ""}
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {formatDate(
                                  transaction.completedAt ||
                                    transaction.createdAt
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    transaction.status === "completed"
                                      ? "bg-green-700 text-green-100"
                                      : transaction.status === "pending"
                                      ? "bg-yellow-700 text-yellow-100"
                                      : transaction.status === "failed"
                                      ? "bg-red-700 text-red-100"
                                      : "bg-gray-700 text-gray-100"
                                  }`}
                                >
                                  {t(
                                    `transaction_status_${transaction.status}`,
                                    transaction.status
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              {t("no_transactions")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <ChevronLeft size={16} className="mr-1" />
                        {t("pagination_previous")}
                      </button>
                      <span className="text-sm text-gray-400">
                        {t("pagination_page", {
                          current: currentPage,
                          total: totalPages,
                        })}{" "}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {t("pagination_next")}
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && userDetails && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg shadow">
                  <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                    <h2 className="text-lg font-medium text-white">
                      {t("profile_settings")}
                    </h2>
                  </div>
                  <form onSubmit={handleUpdateEmail} className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-white">
                          {t("email_address")}
                        </h3>
                        <div className="mt-2 flex items-center">
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-md p-2"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-white">
                          {t("current_password_for_email")}
                        </h3>
                        <div className="mt-2 relative">
                          <input
                            type={
                              showCurrentPasswordEmail ? "text" : "password"
                            }
                            value={currentPasswordEmail}
                            onChange={(e) =>
                              setCurrentPasswordEmail(e.target.value)
                            }
                            required
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-md p-2"
                            placeholder={t("password_placeholder")}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPasswordEmail(
                                !showCurrentPasswordEmail
                              )
                            }
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
                          >
                            {showCurrentPasswordEmail ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={
                            isUpdatingEmail || newEmail === userDetails.email
                          }
                          className="ml-4 bg-blue-700 text-blue-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
                        >
                          {isUpdatingEmail && (
                            <Loader2
                              size={16}
                              className="animate-spin inline mr-2"
                            />
                          )}
                          {t("update")}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="p-6 border-t border-gray-700">
                    <h3 className="text-sm font-medium text-white mb-2">
                      {t("password")}
                    </h3>
                    {!showPasswordChangeForm ? (
                      <button
                        onClick={() => {
                          setShowPasswordChangeForm(true);
                        }}
                        className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                      >
                        {t("change_password")}
                      </button>
                    ) : (
                      <form
                        onSubmit={handleChangePassword}
                        className="space-y-4 mt-2"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            {t("old_password")}
                          </label>
                          <div className="relative">
                            <input
                              type={showOldPassword ? "text" : "password"}
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              required
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-md p-2"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowOldPassword(!showOldPassword)
                              }
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
                            >
                              {showOldPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            {t("new_password")}
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-md p-2"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
                            >
                              {showNewPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {t("password_requirements")}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            {t("confirm_new_password")}
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showConfirmNewPassword ? "text" : "password"
                              }
                              value={confirmNewPassword}
                              onChange={(e) =>
                                setConfirmNewPassword(e.target.value)
                              }
                              required
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-md p-2"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmNewPassword(
                                  !showConfirmNewPassword
                                )
                              }
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
                            >
                              {showConfirmNewPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowPasswordChangeForm(false)}
                            disabled={isChangingPassword}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
                          >
                            {t("cancel")}
                          </button>
                          <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="bg-blue-700 text-blue-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
                          >
                            {isChangingPassword && (
                              <Loader2
                                size={16}
                                className="animate-spin inline mr-2"
                              />
                            )}
                            {t("save_password")}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="p-6 pt-6 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-white">
                        {t("two_factor_auth")}
                      </h3>
                      <div className="flex items-center">
                        <button
                          className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-700"
                          role="switch"
                          aria-checked="false"
                        >
                          <span className="translate-x-0 pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200">
                            <span className="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity opacity-100 ease-in duration-200">
                              <span className="h-3 w-3 bg-gray-400 rounded-full"></span>
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 mb-4">
                      {t("two_factor_description")}
                    </p>
                  </div>

                  <div className="p-6 pt-0 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4 mt-6">
                      <h3 className="text-sm font-medium text-white">
                        {t("email_notifications")}
                      </h3>
                      <div className="flex items-center">
                        <button
                          className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600"
                          role="switch"
                          aria-checked="true"
                        >
                          <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200">
                            <span className="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity opacity-100 ease-in duration-200">
                              <span className="h-3 w-3 bg-blue-600 rounded-full"></span>
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {t("email_notifications_description")}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-700 p-6">
                    <h3 className="text-sm font-medium text-red-500 mb-2">
                      {t("deactivate_account")}
                    </h3>

                    {!showDeactivateConfirm ? (
                      <>
                        <p className="text-sm text-gray-400 mb-4">
                          {t("deactivate_warning")}
                        </p>
                        <button
                          onClick={() => {
                            setShowDeactivateConfirm(true);
                            setDeactivateMessage({ type: "", text: "" });
                          }}
                          className="bg-red-600 text-red-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                        >
                          {t("deactivate_account_button")}
                        </button>
                      </>
                    ) : (
                      <form
                        onSubmit={handleDeactivateAccount}
                        className="space-y-4 mt-2"
                      >
                        <p className="text-sm text-yellow-400 font-semibold">
                          {t("deactivate_confirm_prompt")}
                        </p>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            {t("enter_password_to_confirm")}
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showCurrentPasswordDeactivate
                                  ? "text"
                                  : "password"
                              }
                              value={currentPasswordDeactivate}
                              onChange={(e) =>
                                setCurrentPasswordDeactivate(e.target.value)
                              }
                              required
                              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border border-gray-600 bg-gray-700 text-white rounded-md p-2"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPasswordDeactivate(
                                  !showCurrentPasswordDeactivate
                                )
                              }
                              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
                            >
                              {showCurrentPasswordDeactivate ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowDeactivateConfirm(false)}
                            disabled={isDeactivating}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
                          >
                            {t("cancel")}
                          </button>
                          <button
                            type="submit"
                            disabled={isDeactivating}
                            className="bg-red-600 text-red-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            {isDeactivating && (
                              <Loader2
                                size={16}
                                className="animate-spin inline mr-2"
                              />
                            )}
                            {t("confirm_deactivation")}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
