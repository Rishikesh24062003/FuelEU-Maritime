import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/pools.api', () => ({
  poolsApi: {
    createPool: vi.fn(),
  },
}));

vi.mock('../../api/banking.api', () => ({
  bankingApi: {
    getRecords: vi.fn(),
  },
}));

import PoolPage from '../PoolPage';
import { ToastProvider } from '../../components/ui/ToastProvider';
import { poolsApi } from '../../api/pools.api';

const renderPoolPage = () =>
  render(
    <ToastProvider>
      <PoolPage />
    </ToastProvider>
  );

describe('PoolPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(poolsApi).createPool.mockResolvedValue({
      poolId: 'POOL-123',
      year: 2025,
      status: 'pool_created',
      members: [
        { shipId: 'SHIP001', before: 1000, after: 500 },
        { shipId: 'SHIP002', before: -500, after: 0 },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits pool creation form and displays members', async () => {
    renderPoolPage();

    await userEvent.clear(screen.getByTestId('pool-year'));
    await userEvent.type(screen.getByTestId('pool-year'), '2025');
    await userEvent.type(screen.getByTestId('pool-ship-ids'), 'SHIP001, SHIP002');

    await userEvent.click(screen.getByRole('button', { name: /create pool/i }));

    await waitFor(() => {
      expect(vi.mocked(poolsApi).createPool).toHaveBeenCalledWith({
        year: 2025,
        ships: [{ shipId: 'SHIP001' }, { shipId: 'SHIP002' }],
      });
    });

    expect(await screen.findByText(/pool created/i)).toBeInTheDocument();
    expect(screen.getByText('SHIP001')).toBeInTheDocument();
    expect(screen.getByText('SHIP002')).toBeInTheDocument();
  });
});
