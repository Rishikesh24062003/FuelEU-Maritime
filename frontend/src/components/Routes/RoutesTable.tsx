import { useState } from 'react';
import { Route } from '../../types';
import { routesApi } from '../../api/routes.api';
import { CheckCircle } from 'lucide-react';

interface RoutesTableProps {
  routes: Route[];
  onUpdate: () => void;
  onBaselineSuccess?: (routeId: string) => void;
  onBaselineError?: (message: string) => void;
}

export default function RoutesTable({
  routes,
  onUpdate,
  onBaselineSuccess,
  onBaselineError,
}: RoutesTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSetBaseline(routeId: string) {
    try {
      setLoading(routeId);
      await routesApi.setBaseline(routeId);
      onBaselineSuccess?.(routeId);
      onUpdate();
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to set baseline.';
      onBaselineError?.(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vessel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GHG Intensity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Baseline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.map((route) => (
              <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {route.routeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.vesselType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.fuelType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.ghgIntensity.toFixed(2)} gCO₂e/MJ
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {route.isBaseline ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      BASELINE
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleSetBaseline(route.routeId)}
                    disabled={route.isBaseline || loading === route.routeId}
                    className="btn-primary text-xs"
                  >
                    {loading === route.routeId ? 'Setting...' : 'Set Baseline'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
