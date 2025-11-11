import { useEffect, useState } from 'react';
import { routesApi } from '../api/routes.api';
import { Route } from '../types';
import RoutesTable from '../components/Routes/RoutesTable';
import Header from '../components/Layout/Header';
import { useToast } from '../components/ui/ToastProvider';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function loadRoutes(showSuccess = false) {
    setLoading(true);
    setError(null);
    try {
      const data = await routesApi.getAllRoutes();
      setRoutes(data);
      if (showSuccess) {
        showToast({
          type: 'success',
          title: 'Baseline updated',
          description: 'Route baseline has been updated successfully.',
        });
      }
    } catch (err) {
      console.error(err);
      const message = 'Failed to load routes. Please try again later.';
      setError(message);
      showToast({ type: 'error', title: 'Error loading routes', description: message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoutes().catch(() => null);
  }, []);

  return (
    <div className="flex-1">
      <Header title="Routes Management" />
      <div className="p-6 space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
            <button
              type="button"
              className="ml-3 text-red-600 hover:underline"
              onClick={() => loadRoutes()}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading routes...
          </div>
        ) : (
          <RoutesTable
            routes={routes}
            onUpdate={() => loadRoutes(true)}
            onBaselineSuccess={(routeId) =>
              showToast({
                type: 'success',
                title: 'Baseline updated',
                description: `${routeId} is now the baseline route.`,
              })
            }
            onBaselineError={(message) =>
              showToast({ type: 'error', title: 'Baseline update failed', description: message })
            }
          />
        )}
      </div>
    </div>
  );
}
