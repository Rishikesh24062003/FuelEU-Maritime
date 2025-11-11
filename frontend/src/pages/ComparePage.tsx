import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Layout/Header';
import ComparisonTable from '../components/Compliance/ComparisonTable';
import ComparisonChart from '../components/Compliance/ComparisonChart';
import { routesApi } from '../api/routes.api';
import { complianceApi } from '../api/compliance.api';
import { ComparisonData, Route } from '../types';
import { useToast } from '../components/ui/ToastProvider';

export default function ComparePage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const { showToast } = useToast();

  const availableYears = useMemo(
    () => Array.from(new Set(routes.map((route: Route) => route.year))).sort(),
    [routes]
  );

  useEffect(() => {
    async function loadRoutes() {
      try {
        const data = await routesApi.getAllRoutes();
        console.log(data);
        setRoutes(data);
        if (data.length > 0) {
          const years = Array.from(new Set(data.map((route: Route) => route.year))).sort();
          setSelectedYear(years[0]);
        }
      } catch (err) {
        const message = 'Failed to load routes for comparison.';
        setError(message);
        showToast({ type: 'error', title: 'Error', description: message });
      }
    }

    loadRoutes().catch(() => null);
  }, [showToast]);

  useEffect(() => {
    if (selectedYear === null) return;
    fetchComparison(selectedYear).catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  async function fetchComparison(year: number) {
    setLoading(true);
    setError(null);
    try {
      const data = await routesApi.getComparison(year);
      setComparison(data);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch comparison data.';
      setError(message);
      showToast({ type: 'error', title: 'Comparison failed', description: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoMode() {
    if (selectedYear === null) return;
    setDemoLoading(true);
    try {
      const routesForYear = routes.filter((route: Route) => route.year === selectedYear);
      await Promise.all(
        routesForYear.map((route: Route) =>
          complianceApi.calculateCB({
            shipId: route.routeId,
            year: route.year,
            ghgActual: route.ghgIntensity,
            fuelType: route.fuelType,
            fuelConsumption: route.fuelConsumption,
          }).catch((error) => {
            console.warn('Demo mode CB calculation failed for route', route.routeId, error);
          })
        )
      );
      showToast({
        type: 'success',
        title: 'Demo mode complete',
        description: 'Compliance balances recalculated for selected year routes.',
      });
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Demo mode failed.';
      showToast({ type: 'error', title: 'Demo mode error', description: message });
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="flex-1">
      <Header
        title="Route Comparison"
        action={
          <div className="flex items-center gap-3">
            <select
              className="input w-40"
              value={selectedYear ?? ''}
              onChange={(event) => setSelectedYear(Number.parseInt(event.target.value, 10))}
              disabled={availableYears.length === 0}
            >
              {availableYears.map((year: number) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              className="btn-secondary"
              onClick={() => selectedYear && fetchComparison(selectedYear)}
              disabled={loading || selectedYear === null}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              className="btn-primary"
              onClick={handleDemoMode}
              disabled={demoLoading || selectedYear === null}
            >
              {demoLoading ? 'Running Demo...' : 'Demo Mode'}
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading && !comparison ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading comparison data...
          </div>
        ) : comparison ? (
          <>
            <ComparisonTable comparisons={comparison.comparisons} baseline={comparison.baseline} />
            <ComparisonChart comparisons={comparison.comparisons} baseline={comparison.baseline} />
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Select a year to view comparison data.
          </div>
        )}
      </div>
    </div>
  );
}
