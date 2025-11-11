import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RouteComparison } from '../../types';

interface ComparisonChartProps {
  comparisons: RouteComparison[];
  baseline: { routeId: string; ghgIntensity: number };
}

export default function ComparisonChart({ comparisons, baseline }: ComparisonChartProps) {
  const chartData = [
    {
      name: baseline.routeId,
      baseline: baseline.ghgIntensity,
      comparison: baseline.ghgIntensity,
      isBaseline: true,
    },
    ...comparisons.map((c) => ({
      name: c.routeId,
      baseline: c.baselineGHG,
      comparison: c.comparisonGHG,
      isBaseline: false,
    })),
  ];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        GHG Intensity Comparison
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{
              value: 'GHG Intensity (gCO₂e/MJ)',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="baseline" fill="#10b981" name="Baseline" />
          <Bar dataKey="comparison" fill="#3b82f6" name="Route" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
