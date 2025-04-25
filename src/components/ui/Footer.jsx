import React, { useState, useEffect } from "react";
import WarningAlert from "../../components/ui/WarningAlert";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const [isBottom, setIsBottom] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { t } = useTranslation();

  const checkIfBottom = () => {
    const bottomReached =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 10;
    setIsBottom(bottomReached);
  };

  useEffect(() => {
    checkIfBottom();
    window.addEventListener("scroll", checkIfBottom, { passive: true });
    window.addEventListener("resize", checkIfBottom);

    return () => {
      window.removeEventListener("scroll", checkIfBottom);
      window.removeEventListener("resize", checkIfBottom);
    };
  }, []);

  const handleLinkClick = (e, pageName) => {
    e.preventDefault();
    setAlertMessage(t("footer.message", { page: t(`footer.${pageName}`) }));
  };

  return (
    <>
      <WarningAlert
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />

      <footer
        className={`bg-gray-900 border-gray-900 text-gray-400 fixed bottom-0 left-0 w-full shadow-lg transition-opacity duration-500 ease-in-out ${
          isBottom ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-4 md:px-6 md:py-5">
          <div className="md:flex md:items-center md:justify-between text-center md:text-left">
            <div className="mb-4 md:mb-0 space-y-1">
              <span className="block text-sm">
                © 2025{" "}
                <a href="#" className="hover:underline hover:text-gray-200">
                  SpinBazar™
                </a>
                . All Rights Reserved.
              </span>
            </div>

            <ul className="flex flex-wrap items-center justify-center md:justify-end text-sm font-medium">
              <li className="mb-2 md:mb-0">
                <a
                  href="#"
                  className="hover:underline hover:text-gray-200 me-4 md:me-6"
                  onClick={(e) => handleLinkClick(e, "About")}
                >
                  About
                </a>
              </li>
              <li className="mb-2 md:mb-0">
                <a
                  href="#"
                  className="hover:underline hover:text-gray-200 me-4 md:me-6"
                  onClick={(e) => handleLinkClick(e, "Privacy Policy")}
                >
                  Privacy Policy
                </a>
              </li>
              <li className="mb-2 md:mb-0">
                <a
                  href="#"
                  className="hover:underline hover:text-gray-200 me-4 md:me-6"
                  onClick={(e) => handleLinkClick(e, "Licensing")}
                >
                  Licensing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline hover:text-gray-200"
                  onClick={(e) => handleLinkClick(e, "Contact")}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
