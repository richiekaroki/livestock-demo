import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center">
          <svg className="w-10 h-10 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-text-primary mb-3 tracking-tight">404</h1>
        <p className="text-text-secondary mb-8 text-lg">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Return Home
        </Link>
      </div>
    </div>
  );
}
