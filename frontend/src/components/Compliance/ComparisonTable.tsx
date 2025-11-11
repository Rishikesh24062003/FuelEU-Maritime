import { RouteComparison } from '../../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface ComparisonTableProps {
  comparisons: RouteComparison[];
  baseline: { routeId: string; ghgIntensity: number };
}

export default function ComparisonTable({ comparisons, baseline }: ComparisonTableProps) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Comparison vs Baseline: {baseline.routeId} ({baseline.ghgIntensity.toFixed(2)} gCO₂e/MJ)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Route ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Baseline GHG
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Comparison GHG
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                % Difference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Compliant
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisons.map((comparison) => (
              <tr key={comparison.routeId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {comparison.routeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.baselineGHG.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.comparisonGHG.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`font-medium ${
                      comparison.percentDiff > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {comparison.percentDiff > 0 ? '+' : ''}
                    {comparison.percentDiff.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {comparison.compliant ? (
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-600">
                      <XCircle className="w-5 h-5 mr-1" />
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
