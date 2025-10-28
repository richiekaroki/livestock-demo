import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LivestockList } from "./components/LivestockList";
import ThemeToggle from "./components/ThemeToggle"; // Only import ThemeToggle

function Home() {
  return (
    <div className="bg-[var(--bg-secondary)] p-8 rounded-lg shadow-lg border border-[var(--border-color)]">
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
        Welcome to Livestock Manager
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-800/50">
          <h3 className="font-semibold text-blue-300 mb-2">📊 Dashboard</h3>
          <p className="text-blue-200">
            View all livestock data with health status and locations
          </p>
        </div>
        <div className="p-4 bg-green-950/50 rounded-lg border border-green-800/50">
          <h3 className="font-semibold text-green-300 mb-2">🗺️ Maps</h3>
          <p className="text-green-200">
            See animal locations on interactive maps (coming soon)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-lg text-green-400 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          React is working
        </p>
        <p className="text-lg text-green-400 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          Tailwind CSS v4 is working
        </p>
        <p className="text-lg text-green-400 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          React Router is ready
        </p>
        <p className="text-lg text-green-400 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          Livestock Data loaded
        </p>
      </div>

      <Link
        to="/livestock-data"
        className="nav-button primary inline-block mt-6"
      >
        🐄 View Livestock Dashboard →
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
              🐮 Livestock Management System
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Track and manage your livestock efficiently
            </p>
          </header>

          <nav className="mb-8 flex justify-center space-x-4">
            <Link to="/" className="nav-button">
              🏠 Home
            </Link>
            <Link to="/livestock-data" className="nav-button primary">
              📊 Livestock Dashboard
            </Link>
          </nav>

          <main className="bg-[var(--bg-secondary)] rounded-xl shadow-lg p-2 border border-[var(--border-color)]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/livestock-data" element={<LivestockList />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
