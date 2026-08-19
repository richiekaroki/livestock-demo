// src/components/layout/MobileNav.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDelayedUnmount } from "../../hooks/useDelayedUnmount";
import ThemeToggle from "../ui/ThemeToggle";

const navLinks = [
  { name: "Home", path: "/", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { name: "Dashboard", path: "/dashboard", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )},
  { name: "Map View", path: "/map", icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )},
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { shouldRender, isAnimating } = useDelayedUnmount(isOpen, 200);

  return (
    <nav className="sticky top-0 z-50 nav-backdrop border-b border-border md:hidden">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5c0-1.1.9-2 2-2h2" />
              <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
              <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
              <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-text-primary">
              Wam Mfugo
            </span>
            <span className="text-xs text-text-tertiary">System</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border transition-colors cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div className="w-6 h-6 relative">
              <span
                className={`absolute left-0 top-1 w-6 h-0.5 bg-text-primary rounded-full transition-all duration-200 ${
                  isOpen ? "rotate-45 top-3" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-3 w-6 h-0.5 bg-text-primary rounded-full transition-all duration-200 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-5 w-6 h-0.5 bg-text-primary rounded-full transition-all duration-200 ${
                  isOpen ? "-rotate-45 top-3" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {shouldRender && (
        <div
          className={`absolute top-full left-0 right-0 bg-bg-primary border-b border-border shadow-lg ${
            isAnimating ? "animate-fade-out" : "animate-slide-down"
          }`}
          style={{ transformOrigin: "top" }}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ name, path, icon }, index) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-white shadow-md"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  {icon}
                  {name}
                </Link>
              );
            })}

            {/* Additional Info */}
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-sm text-text-tertiary px-4">
                Wam Mfugo — Livestock Management Demo
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
