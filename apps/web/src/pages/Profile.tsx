import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KENYA_COUNTIES } from '@wam-mfugo/shared';

const counties = KENYA_COUNTIES;

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    county: user?.county || '',
    subCounty: user?.subCounty || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Profile</h1>

      <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-tertiary cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-text-tertiary">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
            <input
              type="text"
              value={user.role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              disabled
              className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-tertiary cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-text-tertiary">Role can only be changed by an admin</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              placeholder="+254700000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">County</label>
            <select
              value={form.county}
              onChange={(e) => setForm({ ...form, county: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            >
              <option value="">Select county</option>
              {counties.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Sub-County</label>
            <input
              type="text"
              value={form.subCounty}
              onChange={(e) => setForm({ ...form, subCounty: e.target.value })}
              className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
