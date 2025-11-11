import { NavLink } from 'react-router-dom';
import { Ship, GitCompare, Wallet, Users } from 'lucide-react';

const navigation = [
  { name: 'Routes', href: '/routes', icon: Ship },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Banking', href: '/banking', icon: Wallet },
  { name: 'Pooling', href: '/pools', icon: Users },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">FuelEU Maritime</h1>
        <p className="text-sm text-gray-400 mt-1">Compliance System</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500"></p>
      </div>
    </div>
  );
}
