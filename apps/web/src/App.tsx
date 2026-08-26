// src/App.tsx
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import Footer from "./components/layout/Footer";
import MobileNav from "./components/layout/MobileNav";
import Navbar from "./components/layout/Navbar";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import OfflineIndicator from "./components/ui/OfflineIndicator";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import RoleRoute from "./components/layout/RoleRoute";
import { useLiveData } from "./hooks/useLiveData";
import { useLivestockStore } from "./store/livestockStore";
import "./styles/css/main.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MapView = lazy(() => import("./pages/MapView"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyInvite = lazy(() => import("./pages/VerifyInvite"));
const Profile = lazy(() => import("./pages/Profile"));
const UserList = lazy(() => import("./pages/admin/UserList"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const Vaccinations = lazy(() => import("./pages/Vaccinations"));
const Outbreaks = lazy(() => import("./pages/Outbreaks"));
const DiseasePrediction = lazy(() => import("./pages/DiseasePrediction"));
const VaccinationCoverage = lazy(() => import("./pages/VaccinationCoverage"));
const MortalityTracking = lazy(() => import("./pages/MortalityTracking"));
const WeightGainAnalytics = lazy(() => import("./pages/WeightGainAnalytics"));
const CountyComparison = lazy(() => import("./pages/CountyComparison"));
const WhatIfSimulator = lazy(() => import("./pages/WhatIfSimulator"));
const Reminders = lazy(() => import("./pages/Reminders"));
const FarmerDashboard = lazy(() => import("./pages/FarmerDashboard"));
const AnimalQR = lazy(() => import("./pages/AnimalQR"));
const HealthAssessment = lazy(() => import("./pages/HealthAssessment"));
const CsvImport = lazy(() => import("./pages/CsvImport"));
const BulkOperations = lazy(() => import("./pages/BulkOperations"));
const KalroReportBuilder = lazy(() => import("./pages/KalroReportBuilder"));
const More = lazy(() => import("./pages/More"));
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
  const { t } = useTranslation();

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
      className={`transition-opacity transition-transform duration-200 ease-out ${
        isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <Suspense fallback={<LoadingSpinner text={t("loading.default")} />}>
        <Routes location={displayLocation}>
          <Route
            path="/"
            element={<Home data={data} loading={loading} error={error} refetch={refetch} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  data={data}
                  filteredData={filteredData}
                  loading={loading}
                  error={error}
                  refetch={refetch}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapView
                  data={filteredData}
                  allData={data}
                  loading={loading}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-invite/:token" element={<VerifyInvite />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><UserList /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><AuditLogs /></RoleRoute></ProtectedRoute>} />
          <Route path="/vaccinations" element={<ProtectedRoute><Vaccinations /></ProtectedRoute>} />
          <Route path="/outbreaks" element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'field_agent']}><Outbreaks /></RoleRoute></ProtectedRoute>} />
          <Route path="/diseases" element={<ProtectedRoute><DiseasePrediction /></ProtectedRoute>} />
          <Route path="/vaccination-coverage" element={<ProtectedRoute><VaccinationCoverage /></ProtectedRoute>} />
          <Route path="/mortality" element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'field_agent']}><MortalityTracking /></RoleRoute></ProtectedRoute>} />
          <Route path="/weight" element={<ProtectedRoute><WeightGainAnalytics /></ProtectedRoute>} />
          <Route path="/county-comparison" element={<ProtectedRoute><CountyComparison /></ProtectedRoute>} />
          <Route path="/simulator" element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'field_agent']}><WhatIfSimulator /></RoleRoute></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/farmer" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/animal-qr" element={<ProtectedRoute><AnimalQR /></ProtectedRoute>} />
          <Route path="/health-assessment" element={<ProtectedRoute><HealthAssessment /></ProtectedRoute>} />
          <Route path="/import" element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'field_agent']}><CsvImport /></RoleRoute></ProtectedRoute>} />
          <Route path="/bulk" element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'field_agent']}><BulkOperations /></RoleRoute></ProtectedRoute>} />
          <Route path="/kalro-report" element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'field_agent']}><KalroReportBuilder /></RoleRoute></ProtectedRoute>} />
          <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function AppContent() {
  const { data, loading, error, refetch } = useLiveData();
  const filters = useLivestockStore((s) => s.filters);
  const { t } = useTranslation();

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
            {t("dashboard.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
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
            className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex-grow bg-bg-primary"
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
      </AuthProvider>
    </Router>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppContent />
    </I18nextProvider>
  );
}

export default App;
