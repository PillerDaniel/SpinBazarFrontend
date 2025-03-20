import React, { useState } from "react";
import axios from "axios";
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
  const [birthDate, setBirthDate] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !email || !password || !passwordConfirmation || !birthDate) {
      setError(t('register_error_message'));
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/auth/register", {
        userName,
        email,
        birthDate,
        password,
        passwordConfirmation,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.userName);

      setSuccessMessage(t('register_success_message'));

      setTimeout(() => {
        login(response.data.token, userName);
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
  }

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <div className="absolute top-5 center" onClick={handleLogoClick}>
        <img src={logo} href="/" alt="SpinBazar Logo" className="w-32" />
      </div>

      <ErrorAlert message={error} onClose={() => setError("")} />
      <SuccessAlert message={successMessage} onClose={() => setSuccessMessage("")} />

      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl mb-8 text-center font-medium">{t('register_head_text')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              id="username"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-800 rounded-lg border border-gray-300 appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="username"
              className="ml-3 font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
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
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-800 rounded-lg border border-gray-300 appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="ml-3 font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              Email
            </label>
          </div>
          <Datepicker
              id="birthDate"
              selected={birthDate}
              onChange={(date) => setBirthDate(date)}
              className="mb-4 block w-full text-sm text-gray-900 bg-gray-800 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          <div className="relative mb-4">
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-800 rounded-lg border border-gray-300 appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="ml-3 font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              {t('register_password')}
            </label>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 focus:outline-none"
            >
              {passwordVisible ? (
                <svg
                  className="w-6 h-6 text-gray-500 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-500 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                  />
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="relative mb-10">
            <input
              type={passwordConfirmationVisible ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              id="passwordConfiramtion"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-800 rounded-lg border border-gray-300 appearance-none dark:text-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="passwordConfiramtion"
              className="ml-3 font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              {t('register_password_confirm')}
            </label>
            <button
              type="button"
              onClick={togglePasswordConfirmationVisibility}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 focus:outline-none"
            >
              {passwordConfirmationVisible ? (
                <svg
                  className="w-6 h-6 text-gray-500 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-500 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                  />
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
          >
            {t('register_button')}
          </button>
        </form>
        <div className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-300">
        {t('register_login_text')}{" "}
          <a href="/Login" className="text-blue-700 hover:underline dark:text-blue-500">
          {t('register_login_button')}
          </a>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Register;
