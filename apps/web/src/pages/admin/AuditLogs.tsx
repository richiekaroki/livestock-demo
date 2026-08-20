import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AuditLogRow {
  id: number;
  event: string;
  email?: string;
  userId?: number;
  ip?: string;
  metadata?: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const eventColors: Record<string, string> = {
  otp_requested: 'bg-blue-500/10 text-blue-600',
  otp_verified: 'bg-green-500/10 text-green-600',
  otp_failed: 'bg-red-500/10 text-red-600',
  account_locked: 'bg-red-500/10 text-red-600',
  account_unlocked: 'bg-green-500/10 text-green-600',
  login_success: 'bg-green-500/10 text-green-600',
  logout: 'bg-gray-500/10 text-gray-600',
  token_refreshed: 'bg-blue-500/10 text-blue-600',
  account_created: 'bg-purple-500/10 text-purple-600',
  account_deactivated: 'bg-red-500/10 text-red-600',
};

const eventLabel = (event: string) =>
  event.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export default function AuditLogs() {
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [emailSearch, setEmailSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set('event', eventFilter);
      if (emailSearch) params.set('email', emailSearch);

      const res = await fetch(`${API_BASE}/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load audit logs');
      setLogs(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [accessToken, eventFilter, emailSearch]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Audit Logs</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none"
        >
          <option value="">All Events</option>
          <option value="otp_requested">OTP Requested</option>
          <option value="otp_verified">OTP Verified</option>
          <option value="otp_failed">OTP Failed</option>
          <option value="login_success">Login Success</option>
          <option value="logout">Logout</option>
          <option value="account_created">Account Created</option>
          <option value="account_locked">Account Locked</option>
          <option value="token_refreshed">Token Refreshed</option>
          <option value="account_deactivated">Account Deactivated</option>
        </select>
        <input
          type="text"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          placeholder="Filter by email..."
          className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No audit logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-text-tertiary font-medium">Event</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">Email</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">IP</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-bg-primary/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventColors[log.event] || 'bg-gray-500/10 text-gray-600'}`}>
                        {eventLabel(log.event)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{log.email || '-'}</td>
                    <td className="px-4 py-3 text-text-tertiary">{log.ip || '-'}</td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
