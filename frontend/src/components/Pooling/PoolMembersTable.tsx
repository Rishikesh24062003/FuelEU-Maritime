import { Pool } from '../../types';
import { ArrowRight } from 'lucide-react';

interface PoolMembersTableProps {
  pool: Pool;
}

export default function PoolMembersTable({ pool }: PoolMembersTableProps) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
        <h3 className="text-lg font-medium text-green-900">
          Pool Created: {pool.poolId}
        </h3>
        <p className="text-sm text-green-700 mt-1">
          Year: {pool.year} | Status: {pool.status}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ship ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                CB Before
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                CB After
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pool.members.map((member) => {
              const change = member.after - member.before;
              return (
                <tr key={member.shipId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.shipId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={member.before >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {member.before.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={member.after >= 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                      {member.after.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
