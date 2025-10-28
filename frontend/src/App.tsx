// src/App.tsx

import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./assets/css/index.css";
import MobileNav from "./components/MobileNav";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";

function App() {
  // Remove filteredData and filters state since Dashboard manages its own

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("livestock-theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapView data={[]} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
