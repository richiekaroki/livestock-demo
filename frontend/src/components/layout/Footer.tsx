// src/components/layout/Footer.tsx

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 5V3" />
                <path d="M12 21v-2" />
                <path d="M5 12H3" />
                <path d="M21 12h-2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Livestock Tracker
              </h3>
              <p className="text-xs text-text-tertiary">Management System</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-text-secondary text-sm max-w-md leading-relaxed">
            A technical demonstration of a Livestock Management System — built
            using React 19, TypeScript, Tailwind CSS 4, and Leaflet.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6" />

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-text-tertiary">
            <a
              href="https://github.com/richiekaroki/livestock-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Source Code
            </a>
            <span className="text-border">|</span>
            <a
              href="mailto:richiekaroki@gmail.com"
              className="hover:text-text-primary transition-colors"
            >
              Contact
            </a>
          </div>

          <p className="text-xs text-text-tertiary">
            &copy; {currentYear} Livestock Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
