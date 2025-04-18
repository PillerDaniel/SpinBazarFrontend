import React, { useState } from "react";
import axiosInstance from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/ui/ErrorAlert";
import SuccessAlert from "../components/ui/SuccessAlert";
import logo from '../assets/img/SpinBazar.svg';
import { Datepicker } from "flowbite-react";
import { useTranslation } from "react-i18next";
import Footer from "../components/ui/Footer";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordConfirmationVisibility = () => {
    setPasswordConfirmationVisible(!passwordConfirmationVisible);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !email || !password || !passwordConfirmation || !birthDate) {
      setError(t('register_error_message'));
      return;
    }

    if (password !== passwordConfirmation) {
      setError(t('register_error_password_mismatch'));
      return;
    }

    const formattedBirthDate = formatDate(birthDate);

    try {
      const response = await axiosInstance.post("/auth/register", {
        userName,
        email,
        birthDate: formattedBirthDate,
        password,
        passwordConfirmation,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.userName);

      setSuccessMessage(t('register_success_message'));

      setTimeout(() => {
        login(response.data.token, response.data.userName);
        navigate("/");
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(t('register_error_message_2'));
      }
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white px-4 relative py-10">
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={handleLogoClick}
      >
        <img src={logo} alt="SpinBazar Logo" className="w-24 sm:w-32" />
      </div>
      <ErrorAlert message={error} onClose={() => setError("")} />
      <SuccessAlert message={successMessage} onClose={() => setSuccessMessage("")} />
      <div className="w-full max-w-md p-6 sm:p-8 bg-gray-800 rounded-lg shadow-lg mt-24 sm:mt-20 mb-15">
        <h1 className="text-2xl sm:text-3xl mb-8 text-center font-medium">{t('register_head_text')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              id="username"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm bg-gray-800 rounded-lg border border-gray-600 appearance-none text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="username"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              {t('register_username')}
            </label>
          </div>
          <div className="relative mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm bg-gray-800 rounded-lg border border-gray-600 appearance-none text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              Email
            </label>
          </div>
          <div className="mb-4">
            <label
              htmlFor="birthDate"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              {t('register_birthdate')}
            </label>
            <Datepicker
              theme={{
                root: { base: "relative" },
                popup: { root: { base: "absolute top-10 z-50 block pt-2" }, footer: { base: "flex justify-end px-3 py-2 border-t border-gray-600 bg-gray-700" } },
                views: { days: { items: { item: { selected: "bg-blue-700 text-white hover:bg-blue-600", disabled: "text-gray-500" } } } },
                input: { base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50", field: { input: { colors: { gray: "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500" }, sizes: { md: "p-2.5 text-sm" } } } }
              }}
              id="birthDate"
              language="hu-HU"
              selected={birthDate}
              onChange={(date) => setBirthDate(date)}
              className="w-full"
              placeholder={t('register_birthdate_placeholder')}
              maxDate={new Date()}
            />
          </div>
          <div className="relative mb-4">
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm bg-gray-800 rounded-lg border border-gray-600 appearance-none text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              {t('register_password')}
            </label>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-white focus:outline-none"
            >
              {passwordVisible ? (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                  <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              )}
            </button>
          </div>
          <div className="relative mb-10">
            <input
              type={passwordConfirmationVisible ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              id="passwordConfirmation"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm bg-gray-800 rounded-lg border border-gray-600 appearance-none text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="passwordConfirmation"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
              {t('register_password_confirm')}
            </label>
            <button
              type="button"
              onClick={togglePasswordConfirmationVisibility}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-white focus:outline-none"
            >
              {passwordConfirmationVisible ? (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                  <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200 ease-in-out"
          >
            {t('register_button')}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
