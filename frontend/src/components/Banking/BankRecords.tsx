import { useState } from 'react';
import { bankingApi } from '../../api/banking.api';
import { BankingRecords as BankingRecordsType } from '../../types';

export default function BankRecords() {
  const [shipId, setShipId] = useState('');
  const [records, setRecords] = useState<BankingRecordsType | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetchRecords(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await bankingApi.getRecords(shipId);
      setRecords(data);
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Banking Records</h3>
      
      <form onSubmit={handleFetchRecords} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Ship ID"
            className="input flex-1"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Fetch Records'}
          </button>
        </div>
      </form>

      {records && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-lg font-semibold text-blue-900">
              Current Balance: {records.currentBalance.toFixed(2)} gCO2e
            </p>
          </div>

          {records.records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={record.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {record.amount >= 0 ? '+' : ''}
                          {record.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.transactionDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No banking records found.</p>
          )}
        </div>
      )}
    </div>
  );
}
