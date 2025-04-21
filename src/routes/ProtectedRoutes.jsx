import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../components/ui/Footer";

function ProtectedRoutes({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900/70 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4 mb-20">
          <div className="max-w-lg w-full bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-4xl font-bold mb-2">
                <span className="text-white">{t('protectedRoutes.loginRequired.titlePart1')} </span>
                <span className="text-cyan-400">{t('protectedRoutes.loginRequired.titlePart2')}</span>
              </h2>
              <p className="text-gray-400 mb-6">
                {t('protectedRoutes.loginRequired.description')}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-gradient-to-r from-purple-800/30 to-pink-800/30 p-4 rounded-lg border border-purple-500/50">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-2xl mr-4 flex-shrink-0">
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">
                      {t('protectedRoutes.loginRequired.protectedContent.title')}
                    </h3>
                    <p className="text-gray-300">
                      {t('protectedRoutes.loginRequired.protectedContent.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gradient-to-r from-cyan-800/30 to-blue-800/30 p-4 rounded-lg border border-cyan-500/50">
                <h3 className="font-bold text-lg text-white mb-1">
                  {t('protectedRoutes.loginRequired.benefits.title')}
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <span className="w-5 h-5 mr-2 text-cyan-400 inline-flex items-center justify-center">✓</span>
                    {t('protectedRoutes.loginRequired.benefits.item1')}
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 mr-2 text-cyan-400 inline-flex items-center justify-center">✓</span>
                    {t('protectedRoutes.loginRequired.benefits.item2')}
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 mr-2 text-cyan-400 inline-flex items-center justify-center">✓</span>
                    {t('protectedRoutes.loginRequired.benefits.item3')}
                  </li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-lg flex justify-center items-center
                    transition duration-150 ease-in-out hover:opacity-90 active:scale-95 active:from-purple-700 active:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed `}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  ) : null}
                  {t('protectedRoutes.loginRequired.loginButton')}
                </button>

                <button
                  onClick={() => setTimeout(() => { setIsLoading(true); navigate("/"); }, 500)}
                  className="w-full py-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium text-lg transition duration-150 ease-in-out hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('protectedRoutes.loginRequired.backButton')}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  {t('protectedRoutes.loginRequired.registerPrompt.start')}{" "}
                  <a href="/register" className="text-cyan-400 hover:underline">
                    {t('protectedRoutes.loginRequired.registerPrompt.link')}
                  </a>{" "}
                  {t('protectedRoutes.loginRequired.registerPrompt.end', { amount: '2$' })}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">{t('protectedRoutes.accessDenied.title')}</h2>
            <p className="text-gray-300 mb-4">
             {t('protectedRoutes.accessDenied.description')}
            </p>
            <button
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium transition duration-150 ease-in-out hover:opacity-90 active:scale-95" // Hozzáadtam hover/active stílusokat
              onClick={() => navigate('/')}
            >
              {t('protectedRoutes.accessDenied.homeButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoutes;