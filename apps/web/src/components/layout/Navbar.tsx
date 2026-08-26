// src/components/layout/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import UserMenu from "./UserMenu";
import { useAuth } from "../../contexts/AuthContext";

const moreItems = [
  { key: "nav.vaccinations", path: "/vaccinations" },
  { key: "nav.weight", path: "/weight" },
  { key: "nav.outbreaks", path: "/outbreaks" },
  { key: "nav.mortality", path: "/mortality" },
  { key: "nav.simulator", path: "/simulator" },
  { key: "nav.county", path: "/county-comparison" },
  { key: "nav.kalro_report", path: "/kalro-report" },
  { key: "nav.import", path: "/import" },
];

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { key: "nav.dashboard", path: "/dashboard" },
    { key: "nav.map", path: "/map" },
    { key: "nav.health_assessment", path: "/health-assessment" },
    { key: "nav.diseases", path: "/diseases" },
    { key: "nav.reminders", path: "/reminders" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  // Close on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const isMoreActive = moreItems.some((item) => location.pathname === item.path);

  return (
    <nav className="sticky top-0 z-50 nav-backdrop border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-base font-bold text-text-primary tracking-tight hidden sm:block">
              {t("app.name")}
            </span>
          </Link>

          {/* Desktop Navigation — only for authenticated users */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ key, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive ? "nav-link-active" : "nav-link-inactive"
                    }`}
                  >
                    {t(key)}
                  </Link>
                );
              })}

              {/* More dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-1 min-h-[44px] ${
                    isMoreActive ? "nav-link-active" : "nav-link-inactive"
                  }`}
                >
                  {t("nav.more")}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {moreOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 py-1 bg-bg-primary border border-border rounded-xl shadow-lg z-50">
                    {moreItems.map(({ key, path }) => (
                      <Link
                        key={path}
                        to={path}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          location.pathname === path
                            ? "text-accent bg-accent/5 font-medium"
                            : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                        }`}
                      >
                        {t(key)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
            <div className="w-px h-5 bg-border" aria-hidden="true" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
