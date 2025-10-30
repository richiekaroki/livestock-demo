// src/components/MobileNav.tsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 md:hidden">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Brand - Consistent with Footer */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-2xl">🐄</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              Livestock Demo
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="mt-4 space-y-2 pb-2">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/map"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                location.pathname === "/map"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Map View
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
