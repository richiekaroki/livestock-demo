import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LivestockList } from "./components/LivestockList";

function Home() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome to Livestock Manager
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📊 Dashboard</h3>
          <p className="text-blue-700">
            View all livestock data with health status and locations
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">🗺️ Maps</h3>
          <p className="text-green-700">
            See animal locations on interactive maps (coming soon)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-lg text-green-600 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          React is working
        </p>
        <p className="text-lg text-green-600 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          Tailwind CSS v4 is working
        </p>
        <p className="text-lg text-green-600 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          React Router is ready
        </p>
        <p className="text-lg text-green-600 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>✅
          Livestock Data loaded
        </p>
      </div>

      <Link
        to="/livestock-data"
        className="inline-block mt-6 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
      >
        🐄 View Livestock Dashboard →
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🐮 Livestock Management System
            </h1>
            <p className="text-lg text-gray-600">
              Track and manage your livestock efficiently
            </p>
          </header>

          <nav className="mb-8 flex justify-center space-x-4">
            <Link
              to="/"
              className="px-6 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm border"
            >
              🏠 Home
            </Link>
            <Link
              to="/livestock-data"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              📊 Livestock Dashboard
            </Link>
          </nav>

          <main className="bg-white rounded-xl shadow-lg p-2">
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
