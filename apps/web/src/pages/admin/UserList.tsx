import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserRow {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  county: string;
  subCounty?: string;
  isActive: boolean;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  field_agent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  farmer: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function UserList() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('isActive', statusFilter === 'active' ? 'true' : 'false');

      const res = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, search, roleFilter, statusFilter]);

  const toggleActive = async (user: UserRow) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const changeRole = async (user: UserRow, role: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const revokeSessions = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/revoke-sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke sessions');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke sessions');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">User Management</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="field_agent">Field Agent</option>
          <option value="farmer">Farmer</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-text-tertiary font-medium">Name</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">Email</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">Role</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">County</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">Status</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">Created</th>
                  <th className="px-4 py-3 text-text-tertiary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-bg-primary/50 transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user, e.target.value)}
                        className={`px-2 py-1 rounded-lg border text-xs font-medium ${roleBadgeColors[user.role] || ''}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="field_agent">Field Agent</option>
                        <option value="farmer">Farmer</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{user.county}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(user)}
                          className="px-2 py-1 text-xs font-medium rounded-lg border border-border hover:bg-bg-primary transition-colors"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => revokeSessions(user.id)}
                          className="px-2 py-1 text-xs font-medium rounded-lg border border-border hover:bg-bg-primary transition-colors"
                        >
                          Revoke Sessions
                        </button>
                      </div>
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
