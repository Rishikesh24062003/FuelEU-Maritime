import { useState } from 'react';
import { poolsApi } from '../../api/pools.api';
import { Pool } from '../../types';

interface PoolCreateFormProps {
  onPoolCreated: (pool: Pool) => void;
}

export default function PoolCreateForm({ onPoolCreated }: PoolCreateFormProps) {
  const [year, setYear] = useState(2025);
  const [shipIds, setShipIds] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const ids = shipIds.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length < 2) {
        alert('Please enter at least 2 ship IDs');
        return;
      }

      const result = await poolsApi.createPool({
        year,
        ships: ids.map(id => ({ shipId: id })),
      });
      
      alert('✅ Pool created successfully!');
      onPoolCreated(result);
      setShipIds('');
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create Compliance Pool</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            type="number"
            className="input"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ship IDs (comma-separated)
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g., SHIP001, SHIP002, SHIP003"
            value={shipIds}
            onChange={(e) => setShipIds(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter at least 2 ship IDs</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating Pool...' : 'Create Pool'}
        </button>
      </form>
    </div>
  );
}
