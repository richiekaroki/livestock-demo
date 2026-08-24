import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  field_agent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  farmer: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const badgeClass = roleBadgeColors[user.role] || 'bg-gray-500/10 text-gray-600';
  const roleLabel = user.role
    .replace('_', ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-medium text-accent">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden lg:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-text-primary">{user.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded border ${badgeClass}`}>
            {roleLabel}
          </span>
        </div>
        <svg className={`w-4 h-4 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-bg-secondary border border-border rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-text-primary">{user.name}</p>
            <p className="text-xs text-text-tertiary">{user.email}</p>
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary transition-colors"
          >
            My Profile
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/admin/users"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary transition-colors"
            >
              User Management
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/admin/audit-logs"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary transition-colors"
            >
              Audit Logs
            </Link>
          )}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
