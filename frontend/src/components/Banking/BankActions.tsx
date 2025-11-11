import { useState } from 'react';
import { bankingApi } from '../../api/banking.api';
import { complianceApi } from '../../api/compliance.api';
import { useToast } from '../ui/ToastProvider';

export default function BankActions() {
  const [calcForm, setCalcForm] = useState({
    shipId: '',
    year: 2025,
    ghgActual: '',
    fuelType: 'HFO',
    fuelConsumption: '',
  });

  const [bankForm, setBankForm] = useState({
    shipId: '',
    year: 2025,
    amount: '',
  });

  const [applyForm, setApplyForm] = useState({
    sourceShipId: '',
    targetShipId: '',
    year: 2025,
    amount: '',
  });

  const [loading, setLoading] = useState(false);
  const [cbResult, setCbResult] = useState<any>(null);
  const { showToast } = useToast();

  const parseAmount = (value: string) => Number.parseFloat(value || '0');

  async function handleCalculateCB(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await complianceApi.calculateCB({
        ...calcForm,
        ghgActual: parseAmount(calcForm.ghgActual),
        fuelConsumption: parseAmount(calcForm.fuelConsumption),
      });
      setCbResult(result);
      showToast({
        type: 'success',
        title: 'CB calculated',
        description: `${result.shipId} has ${result.complianceBalance.toFixed(2)} gCO₂e`,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to calculate CB.';
      showToast({ type: 'error', title: 'Calculation failed', description: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleBankCB(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await bankingApi.bankCB({
        ...bankForm,
        amount: parseAmount(bankForm.amount),
      });
      showToast({
        type: 'success',
        title: 'Bank successful',
        description: `${bankForm.amount} gCO₂e stored for ${bankForm.shipId}`,
      });
      setBankForm({ ...bankForm, amount: '' });
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to bank CB.';
      showToast({ type: 'error', title: 'Banking failed', description: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyCB(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await bankingApi.applyCB({
        ...applyForm,
        amount: parseAmount(applyForm.amount),
      });
      showToast({
        type: 'success',
        title: 'Transfer applied',
        description: `${result.transfer.amount} gCO₂e sent to ${result.targetShip.shipId}. Remaining bank: ${result.sourceShip.remainingBank.toFixed?.(2) ?? result.sourceShip.remainingBank}`,
      });
      setApplyForm({ ...applyForm, amount: '' });
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to apply banked CB.';
      showToast({ type: 'error', title: 'Transfer failed', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Calculate CB */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Calculate Compliance Balance</h3>
        <form onSubmit={handleCalculateCB} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ship ID"
              className="input"
              value={calcForm.shipId}
              onChange={(e) => setCalcForm({ ...calcForm, shipId: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Year"
              className="input"
              value={calcForm.year}
              onChange={(e) => setCalcForm({ ...calcForm, year: parseInt(e.target.value) })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="GHG Actual"
              className="input"
              value={calcForm.ghgActual}
              onChange={(e) => setCalcForm({ ...calcForm, ghgActual: e.target.value })}
              required
            />
            <select
              className="input"
              value={calcForm.fuelType}
              onChange={(e) => setCalcForm({ ...calcForm, fuelType: e.target.value })}
            >
              <option value="HFO">HFO</option>
              <option value="LNG">LNG</option>
              <option value="MGO">MGO</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Fuel Consumption (tons)"
              className="input"
              value={calcForm.fuelConsumption}
              onChange={(e) => setCalcForm({ ...calcForm, fuelConsumption: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Calculating...' : 'Calculate CB'}
          </button>
        </form>
        {cbResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm">
              <strong>CB:</strong> {cbResult.complianceBalance.toFixed(2)} gCO2e
              <span className={`ml-2 ${cbResult.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                ({cbResult.status})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Bank CB */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Positive CB</h3>
        <form onSubmit={handleBankCB} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Ship ID"
              className="input"
              value={bankForm.shipId}
              onChange={(e) => setBankForm({ ...bankForm, shipId: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Year"
              className="input"
              value={bankForm.year}
              onChange={(e) => setBankForm({ ...bankForm, year: parseInt(e.target.value) })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              className="input"
              value={bankForm.amount}
              onChange={(e) => setBankForm({ ...bankForm, amount: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Banking...' : 'Bank CB'}
          </button>
        </form>
      </div>

      {/* Apply Banked CB */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Apply Banked CB to Deficit</h3>
        <form onSubmit={handleApplyCB} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Source Ship ID"
              className="input"
              value={applyForm.sourceShipId}
              onChange={(e) => setApplyForm({ ...applyForm, sourceShipId: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Target Ship ID"
              className="input"
              value={applyForm.targetShipId}
              onChange={(e) => setApplyForm({ ...applyForm, targetShipId: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Year"
              className="input"
              value={applyForm.year}
              onChange={(e) => setApplyForm({ ...applyForm, year: parseInt(e.target.value) })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              className="input"
              value={applyForm.amount}
              onChange={(e) => setApplyForm({ ...applyForm, amount: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Applying...' : 'Apply Banked CB'}
          </button>
        </form>
      </div>
    </div>
  );
}
