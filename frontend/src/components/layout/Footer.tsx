// src/components/layout/Footer.tsx

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-bg-primary text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Brand Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4">
          <span className="text-2xl">🐄</span>
          <h3 className="text-lg font-semibold text-text-primary">
            Livestock Tracker
          </h3>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-6 max-w-2xl mx-auto leading-relaxed">
          A technical demonstration of a Livestock Management System — built
          using React 19, TypeScript, Tailwind CSS 4, and Leaflet.
        </p>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-text-tertiary mb-3">
          <a
            href="https://github.com/richiekaroki/livestock-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium transition-colors"
          >
            View Source on GitHub
          </a>
          <span className="hidden sm:block">•</span>
          <a
            href="mailto:richiekaroki@gmail.com"
            className="hover:text-text-primary transition-colors"
          >
            Contact Developer
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-text-tertiary">
          © {currentYear} Livestock Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
