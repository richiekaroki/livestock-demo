// src/components/layout/MobileNav.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Map View", path: "/map" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/95 border-b border-border md:hidden backdrop-blur-md">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setIsOpen(false)}
        >
          <span className="text-2xl">🐄</span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-text-primary">
              Livestock Tracker
            </span>
            <span className="text-xs text-text-tertiary">System</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div className="w-6 h-6 relative">
              <span
                className={`absolute left-0 top-1 w-6 h-0.5 bg-text-primary transition-all duration-300 ${
                  isOpen ? "rotate-45 top-3" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-3 w-6 h-0.5 bg-text-primary transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-5 w-6 h-0.5 bg-text-primary transition-all duration-300 ${
                  isOpen ? "-rotate-45 top-3" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-bg-primary border-b border-border shadow-lg animate-fadeIn">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map(({ name, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-white shadow-md"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  }`}
                >
                  {name}
                </Link>
              );
            })}

            {/* Additional Info */}
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-sm text-text-tertiary px-4">
                Livestock Management Demo
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
