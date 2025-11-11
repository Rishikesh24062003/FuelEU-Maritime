import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import RoutesPage from './pages/RoutesPage';
import ComparePage from './pages/ComparePage';
import BankingPage from './pages/BankingPage';
import PoolPage from './pages/PoolPage';
import { ToastProvider } from './components/ui/ToastProvider';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/routes" replace />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/banking" element={<BankingPage />} />
                <Route path="/pools" element={<PoolPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
