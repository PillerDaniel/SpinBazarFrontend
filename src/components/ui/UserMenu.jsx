import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserMenu = ({ isOpen, onClose, onLogout, userRole }) => {
  const [menuPosition, setMenuPosition] = useState("translate-x-full");
  const navigate = useNavigate();
  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (isOpen) {
      setMenuPosition("translate-x-0");
    } else {
      const timeout = setTimeout(() => {
        setMenuPosition("translate-x-full");
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto w-64 bg-gray-800 transition-transform duration-500 ease-in-out transform ${menuPosition}`}
    >
      <button
        onClick={onClose}
        className="text-white-400 bg-transparent hover:text-white-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 left-2.5"
      >
        <svg
          className="w-6 h-6 text-white ease-in-out transform hover:scale-110"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18 17.94 6M18 18 6.06 6"
          />
        </svg>
      </button>
      <div className="py-4">
        <h5 className="text-base font-semibold uppercase text-gray-400 mt-5 mb-2">
          Profile
        </h5>
        <ul className="space-y-2 font-medium">
          <li>
            <button
              onClick={""}
              className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="flex ml-3 whitespace-nowrap">Account</span>
            </button>
          </li>
        </ul>
        
        {isAdmin && (
          <ul className="space-y-2 font-medium">
            <li>
              <button
                onClick={""}
                className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield-user text-yellow-500"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="M6.376 18.91a6 6 0 0 1 11.249.003" />
                  <circle cx="12" cy="11" r="4" />
                </svg>
                <span className="flex ml-3 whitespace-nowrap">Admin panel</span>
              </button>
            </li>
          </ul>
        )}
        
        <ul className="space-y-2 font-medium">
          <li>
            <button
              onClick={() => navigate("/statistics")}
              className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chart-no-axes-combined"
              >
                <path d="M12 16v5" />
                <path d="M16 14v7" />
                <path d="M20 10v11" />
                <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" />
                <path d="M4 18v3" />
                <path d="M8 14v7" />
              </svg>
              <span className="flex ml-3 whitespace-nowrap">Statistics</span>
            </button>
          </li>
        </ul>
        <ul className="space-y-2 font-medium">
          <li>
            <button
              onClick={""}
              className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-settings"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="flex ml-3 whitespace-nowrap">Settings</span>
            </button>
          </li>
        </ul>
        <ul className="space-y-2 font-medium">
          <li>
            <button
              onClick={onLogout}
              className="flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group w-full"
            >
              <svg
                className="w-6 h-6 text-red-400 rtl:rotate-180 ease-in-out transform group-hover:scale-110"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                />
              </svg>
              <span className="flex ml-3 text-red-400 whitespace-nowrap">
                Sign out
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserMenu;