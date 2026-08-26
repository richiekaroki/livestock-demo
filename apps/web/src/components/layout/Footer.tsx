// src/components/layout/Footer.tsx

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-base font-bold text-text-primary tracking-tight">
              Wam Mfugo
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-text-tertiary">
            &copy; {currentYear} Wam Mfugo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
