import React from 'react';
import { Truck, Bell, Settings, User } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, notificationCount }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Truck },
    { id: 'drivers', label: 'Motoristas', icon: User },
    { id: 'vehicles', label: 'Veículos', icon: Truck },
    { id: 'notifications', label: 'Notificações', icon: Bell }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">
              Controle de Documentação Veicular
            </h1>
          </div>
          
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.id === 'notifications' && notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-500">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;