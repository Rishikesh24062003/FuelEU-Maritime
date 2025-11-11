import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/routes.api', () => ({
  routesApi: {
    getAllRoutes: vi.fn(),
    setBaseline: vi.fn(),
  },
}));

import RoutesPage from '../RoutesPage';
import { ToastProvider } from '../../components/ui/ToastProvider';
import { routesApi } from '../../api/routes.api';

const renderWithProviders = () =>
  render(
    <ToastProvider>
      <RoutesPage />
    </ToastProvider>
  );

describe('RoutesPage', () => {
  beforeEach(() => {
    const mockedRoutesApi = vi.mocked(routesApi);
    mockedRoutesApi.getAllRoutes.mockResolvedValue([
      {
        id: '1',
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2025,
        ghgIntensity: 89.33,
        fuelConsumption: 1200,
        distance: 4500,
        totalEmissions: 987,
        isBaseline: false,
      },
    ]);
    mockedRoutesApi.setBaseline.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders routes and allows setting baseline', async () => {
    const mockedRoutesApi = vi.mocked(routesApi);

    renderWithProviders();

    expect(await screen.findByText('R001')).toBeInTheDocument();

    const baselineButton = screen.getByRole('button', { name: /set baseline/i });
    await userEvent.click(baselineButton);

    await waitFor(() => {
      expect(mockedRoutesApi.setBaseline).toHaveBeenCalledWith('R001');
    });
  });
});
