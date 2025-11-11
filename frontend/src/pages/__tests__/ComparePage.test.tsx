import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/routes.api', () => ({
  routesApi: {
    getAllRoutes: vi.fn(),
    getComparison: vi.fn(),
  },
}));

vi.mock('../../api/compliance.api', () => ({
  complianceApi: {
    calculateCB: vi.fn(),
  },
}));

import ComparePage from '../ComparePage';
import { ToastProvider } from '../../components/ui/ToastProvider';
import { routesApi } from '../../api/routes.api';

const renderCompare = () =>
  render(
    <ToastProvider>
      <ComparePage />
    </ToastProvider>
  );

describe('ComparePage', () => {
  beforeEach(() => {
    const mockedRoutesApi = vi.mocked(routesApi);
    mockedRoutesApi.getAllRoutes.mockResolvedValue([
      {
        id: '1',
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2025,
        ghgIntensity: 88,
        fuelConsumption: 1200,
        distance: 4500,
        totalEmissions: 987,
        isBaseline: true,
      },
      {
        id: '2',
        routeId: 'R002',
        vesselType: 'Tanker',
        fuelType: 'LNG',
        year: 2025,
        ghgIntensity: 90,
        fuelConsumption: 1100,
        distance: 4200,
        totalEmissions: 950,
        isBaseline: false,
      },
    ]);
    mockedRoutesApi.getComparison.mockResolvedValue({
      year: 2025,
      baseline: {
        routeId: 'R001',
        ghgIntensity: 88,
      },
      comparisons: [
        {
          routeId: 'R002',
          baselineGHG: 88,
          comparisonGHG: 90,
          percentDiff: 2.27,
          compliant: false,
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads routes and renders comparison table', async () => {
    renderCompare();

    await waitFor(() => {
      expect(screen.getByText(/comparison vs baseline/i)).toBeInTheDocument();
    });

    expect(screen.getByText('R002')).toBeInTheDocument();
    expect(screen.getByText('+2.27%')).toBeInTheDocument();
  });

  it('allows refreshing comparison for selected year', async () => {
    const mockedRoutesApi = vi.mocked(routesApi);

    renderCompare();

    await screen.findByText('R002');

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);

    expect(mockedRoutesApi.getComparison).toHaveBeenCalledWith(2025);
  });
});
