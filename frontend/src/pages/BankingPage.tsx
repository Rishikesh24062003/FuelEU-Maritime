import Header from '../components/Layout/Header';
import BankActions from '../components/Banking/BankActions';
import BankRecords from '../components/Banking/BankRecords';

export default function BankingPage() {
  return (
    <div className="flex-1">
      <Header title="Banking Operations" />
      <div className="p-6 space-y-6">
        <BankActions />
        <BankRecords />
      </div>
    </div>
  );
}
