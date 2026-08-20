import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KENYA_COUNTIES } from '@wam-mfugo/shared';

const counties = KENYA_COUNTIES;

export default function Register() {
  const { register, verifyRegistration, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    county: '',
  });
  const [otp, setOtp] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const result = await register(form);
      setSuccess(result.message);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await verifyRegistration(form.email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5c0-1.1.9-2 2-2h2" />
              <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
              <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
              <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-secondary mt-1">Join Wam Mfugo today</p>
        </div>

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

          {step === 'form' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="Richard Karoki"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="+254700000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">County</label>
                <select
                  value={form.county}
                  onChange={(e) => setForm({ ...form, county: e.target.value })}
                  required
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-text-primary text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="000000"
                  autoFocus
                />
                <p className="mt-2 text-sm text-text-tertiary text-center">
                  Enter the 6-digit code sent to {form.email}
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                className="w-full py-2.5 text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Back to form
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent/80 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
