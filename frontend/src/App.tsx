// src/App.tsx
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import MobileNav from "./components/layout/MobileNav";
import Navbar from "./components/layout/Navbar";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import OfflineIndicator from "./components/ui/OfflineIndicator";
import { useLiveData } from "./hooks/useLiveData";
import { useLivestockStore } from "./store/livestockStore";
import "./styles/css/main.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MapView = lazy(() => import("./pages/MapView"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const { data, loading, error, refetch } = useLiveData();
  const filters = useLivestockStore((s) => s.filters);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("livestock-theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const theme = prefersDark ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("livestock-theme", theme);
    }
  }, []);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((animal) => {
      return (
        (filters.type === "" || animal.type === filters.type) &&
        (filters.health === "" || animal.health === filters.health) &&
        (filters.county === "" || animal.county === filters.county)
      );
    });
  }, [data, filters]);

  // Update offline state when network status changes
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Loading screen
  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐄</div>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Loading livestock data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <OfflineIndicator />

        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>

        <main
          className={`w-full px-4 sm:px-6 md:px-8 py-4 flex-grow bg-[var(--color-bg-primary)] transition-all duration-300 ${
            isOffline ? "mt-12" : ""
          }`}
        >
          <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    data={data}
                    filteredData={filteredData}
                    loading={loading}
                    error={error}
                    refetch={refetch}
                  />
                }
              />
              <Route
                path="/map"
                element={
                  <MapView
                    data={filteredData}
                    allData={data}
                  />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
