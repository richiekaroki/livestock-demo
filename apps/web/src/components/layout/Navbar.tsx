// src/components/layout/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Map View", path: "/map" },
];

export default function Navbar() {
  const location = useLocation();

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
                Wam Mfugo
              </h1>
              <p className="text-xs text-text-tertiary hidden sm:block">
                Livestock Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ name, path }) => {
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
                  {name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-text-primary">
                Full-Stack SuperApp
              </span>
              <span className="text-xs text-text-tertiary">Demo System</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
