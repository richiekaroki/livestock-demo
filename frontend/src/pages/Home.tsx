// src/pages/Home.tsx

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="bg-bg-primary text-text-primary transition-colors duration-300">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-bg-secondary border-b border-border">
        <div className="animate-fadeIn">
          <div className="text-6xl mb-4">🐄</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Livestock Tracker
          </h1>
          <p className="max-w-2xl mx-auto text-text-secondary text-sm sm:text-base leading-relaxed">
            A modern livestock management system for monitoring, analyzing, and
            visualizing your herds across counties — built with React 19,
            TypeScript, Tailwind CSS 4, and Leaflet.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              to="/dashboard"
              className="btn btn-primary text-sm sm:text-base"
            >
              Go to Dashboard
            </Link>
            <Link to="/map" className="btn btn-secondary text-sm sm:text-base">
              View Interactive Map
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-bg-primary border-b border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            Manage Everything, Effortlessly
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-12">
            Track animal health, distribution, and performance in one intuitive
            interface — with real-time filtering, analytics, and map-based
            visualization.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Dashboard Feature */}
            <div className="card hover:shadow-md transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-accent mb-3 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3v18h18M9 17V9m4 8V5m4 12v-6"
                />
              </svg>
              <h3 className="font-semibold text-lg mb-1">
                Comprehensive Dashboard
              </h3>
              <p className="text-sm text-text-secondary">
                Monitor livestock health, types, and distribution metrics at a
                glance.
              </p>
            </div>

            {/* Map Feature */}
            <div className="card hover:shadow-md transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-accent mb-3 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-6-2V6l6 2 6-2 6 2v12l-6-2-6 2z"
                />
              </svg>
              <h3 className="font-semibold text-lg mb-1">Interactive Map</h3>
              <p className="text-sm text-text-secondary">
                Visualize livestock across counties with dynamic clustering and
                filters.
              </p>
            </div>

            {/* Management Feature */}
            <div className="card hover:shadow-md transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-accent mb-3 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 4H4v16h7m9-8h-9m9 0l-3 3m3-3l-3-3"
                />
              </svg>
              <h3 className="font-semibold text-lg mb-1">Smart Management</h3>
              <p className="text-sm text-text-secondary">
                Add, filter, and analyze livestock data seamlessly with
                real-time updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visualization CTA Section */}
      <section className="py-20 px-4 bg-bg-tertiary text-center border-b border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
            See Your Data Come to Life
          </h2>
          <p className="text-text-secondary mb-6">
            Jump into the interactive map to view your livestock distribution —
            color-coded, filterable, and beautifully animated.
          </p>
          <Link to="/map" className="btn btn-primary">
            Explore Map
          </Link>
        </div>
      </section>

      {/* Project Info Section */}
      <section className="py-16 px-4 bg-bg-secondary text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
            Designed for Demonstration & Real-World Readiness
          </h2>
          <p className="text-text-secondary mb-8">
            This project demonstrates full-stack proficiency with scalable React
            architecture, data visualization, and consistent UI design — ideal
            for production expansion or portfolio presentation.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://github.com/richiekaroki/livestock-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View Source on GitHub
            </a>
            <a href="mailto:richiekaroki@gmail.com" className="btn btn-primary">
              Contact Developer
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
