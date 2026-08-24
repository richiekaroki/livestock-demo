import { useAuth } from '../contexts/AuthContext';

export default function OfflineBanner() {
  const { isOffline } = useAuth();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 text-center py-2 text-sm font-medium shadow-md">
      Offline — using cached data
    </div>
  );
}
