// src/App.tsx
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer";
import MobileNav from "./components/layout/MobileNav";
import Navbar from "./components/layout/Navbar";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import OfflineIndicator from "./components/ui/OfflineIndicator";
import { useLiveData } from "./hooks/useLiveData";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useLivestockStore } from "./store/livestockStore";
import "./styles/css/main.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MapView = lazy(() => import("./pages/MapView"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AnimatedRoutes({
  data,
  filteredData,
  loading,
  error,
  refetch,
}: {
  data: ReturnType<typeof useLiveData>["data"];
  filteredData: ReturnType<typeof useLiveData>["data"];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
        <Routes location={displayLocation}>
          <Route
            path="/"
            element={<Home data={data} loading={loading} error={error} refetch={refetch} />}
          />
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
                loading={loading}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  const { data, loading, error, refetch } = useLiveData();
  const filters = useLivestockStore((s) => s.filters);
  const isOffline = !useOnlineStatus();

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

  // Loading screen
  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary text-text-primary transition-colors">
        <div className="text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5c0-1.1.9-2 2-2h2" />
              <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
              <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
              <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary font-medium">
            Loading livestock data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors bg-bg-primary text-text-primary">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <OfflineIndicator />

        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>

        <main
          id="main-content"
          className={`w-full px-4 sm:px-6 md:px-8 py-4 flex-grow bg-bg-primary transition-all duration-200 ${
            isOffline ? "mt-12" : ""
          }`}
        >
          <AnimatedRoutes
            data={data}
            filteredData={filteredData}
            loading={loading}
            error={error}
            refetch={refetch}
          />
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
