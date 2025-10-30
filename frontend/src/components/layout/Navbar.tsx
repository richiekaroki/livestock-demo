// src/components/Navbar.tsx

import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - Consistent with Footer */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🐄</span>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Livestock Demo
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/map"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/map"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Map View
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
              Demo for Lead Full-Stack Developer Position
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
