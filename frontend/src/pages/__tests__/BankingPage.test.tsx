import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/banking.api', () => ({
  bankingApi: {
    bankCB: vi.fn(),
    applyCB: vi.fn(),
    getRecords: vi.fn(),
  },
}));

vi.mock('../../api/compliance.api', () => ({
  complianceApi: {
    calculateCB: vi.fn(),
  },
}));

import BankingPage from '../BankingPage';
import { ToastProvider } from '../../components/ui/ToastProvider';
import { bankingApi } from '../../api/banking.api';
import { complianceApi } from '../../api/compliance.api';

const renderBanking = () =>
  render(
    <ToastProvider>
      <BankingPage />
    </ToastProvider>
  );

describe('BankingPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(complianceApi).calculateCB.mockResolvedValue({
      shipId: 'SHIP001',
      year: 2025,
      ghgTarget: 89.33,
      ghgActual: 85,
      energyInScope: 10_000,
      complianceBalance: 1000,
      status: 'COMPLIANT',
      isCompliant: true,
    });
    vi.mocked(bankingApi).bankCB.mockResolvedValue(undefined);
    vi.mocked(bankingApi).applyCB.mockResolvedValue({
      sourceShip: { shipId: 'SHIP001', remainingBank: 500 },
      targetShip: { shipId: 'SHIP002', cbAfter: 0 },
      transfer: { amount: 500, status: 'applied' },
    });
    vi.mocked(bankingApi).getRecords.mockResolvedValue({
      shipId: 'SHIP001',
      currentBalance: 1000,
      records: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits calculate CB form', async () => {
    renderBanking();

    await userEvent.type(screen.getByTestId('calc-ship-id'), 'SHIP001');
    await userEvent.type(screen.getByTestId('calc-ghg-actual'), '85');
    await userEvent.type(screen.getByTestId('calc-fuel-consumption'), '100');

    await userEvent.click(screen.getByRole('button', { name: /calculate cb/i }));

    await waitFor(() => {
      expect(vi.mocked(complianceApi).calculateCB).toHaveBeenCalled();
    });
  });

  it('submits bank CB form', async () => {
    renderBanking();

    await userEvent.type(screen.getByTestId('bank-ship-id'), 'SHIP001');
    await userEvent.type(screen.getByTestId('bank-year'), '2025');
    await userEvent.type(screen.getByTestId('bank-amount'), '500');

    await userEvent.click(screen.getByRole('button', { name: /bank cb/i }));

    await waitFor(() => {
      expect(vi.mocked(bankingApi).bankCB).toHaveBeenCalledWith({
        shipId: 'SHIP001',
        year: 2025,
        amount: 500,
      });
    });
  });

  it('fetches banking records', async () => {
    renderBanking();

    await userEvent.type(screen.getByTestId('records-ship-id'), 'SHIP001');

    await userEvent.click(screen.getByRole('button', { name: /fetch records/i }));

    await waitFor(() => {
      expect(vi.mocked(bankingApi).getRecords).toHaveBeenCalledWith('SHIP001');
    });
  });
});
