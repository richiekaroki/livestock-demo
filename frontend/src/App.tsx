// src/App.tsx
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./assets/css/index.css";
import Footer from "./components/layout/Footer";
import MobileNav from "./components/layout/MobileNav";
import Navbar from "./components/layout/Navbar";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { useLiveData } from "./hooks/useLiveData";
import type { Filters } from "./types";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MapView = lazy(() => import("./pages/MapView"));

function App() {
  const { data, loading, error, refetch } = useLiveData();
  const [filters, setFilters] = useState<Filters>({
    type: "",
    health: "",
    county: "",
  });

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

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐄</div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Loading livestock data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>

        <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 flex-grow">
          <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    data={data}
                    filteredData={filteredData}
                    filters={filters}
                    onFilterChange={handleFilterChange}
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
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    allData={data}
                  />
                }
              />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
