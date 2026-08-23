// src/components/layout/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import UserMenu from "./UserMenu";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { key: "nav.home", path: "/" },
    { key: "nav.dashboard", path: "/dashboard" },
    { key: "nav.map", path: "/map" },
    { key: "nav.diseases", path: "/diseases" },
    { key: "nav.reminders", path: "/reminders" },
    { key: "nav.farmer_dashboard", path: "/farmer" },
    { key: "nav.photo_assessment", path: "/health-assessment" },
  ];

  return (
    <nav className="sticky top-0 z-50 nav-backdrop border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 5V3" />
                <path d="M12 21v-2" />
                <path d="M5 12H3" />
                <path d="M21 12h-2" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                {t("app.name")}
              </h1>
              <p className="text-xs text-text-tertiary hidden sm:block">
                Livestock Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ key, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "nav-link-active"
                      : "nav-link-inactive"
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                {t("nav.login")}
              </Link>
            )}
            <div className="w-px h-6 bg-border"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
