// src/components/layout/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Map View", path: "/map" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🐄</span>
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Livestock Tracker
              </h1>
              <p className="text-xs text-text-tertiary hidden sm:block">
                Management System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ name, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-white shadow-sm"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  }`}
                >
                  {name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-text-primary">
                Livestock Management
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
