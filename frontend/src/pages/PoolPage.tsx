import { useState } from 'react';
import Header from '../components/Layout/Header';
import PoolCreateForm from '../components/Pooling/PoolCreateForm';
import PoolMembersTable from '../components/Pooling/PoolMembersTable';
import { Pool } from '../types';

export default function PoolPage() {
  const [pool, setPool] = useState<Pool | null>(null);

  return (
    <div className="flex-1">
      <Header title="Compliance Pooling" />
      <div className="p-6 space-y-6">
        <PoolCreateForm onPoolCreated={setPool} />
        {pool ? (
          <PoolMembersTable pool={pool} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Create a pool to view results here.
          </div>
        )}
      </div>
    </div>
  );
}
