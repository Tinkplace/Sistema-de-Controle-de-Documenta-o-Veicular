import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import DriverList from './components/Drivers/DriverList';
import VehicleList from './components/Vehicles/VehicleList';
import NotificationList from './components/Notifications/NotificationList';
import DocumentFilter from './components/DocumentFilter/DocumentFilter';
import Modal from './components/Common/Modal';
import DriverForm from './components/Forms/DriverForm';
import VehicleForm from './components/Forms/VehicleForm';
import { useDocumentSystem } from './hooks/useDocumentSystem';
import { Driver, Vehicle } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const {
    drivers,
    vehicles,
    notifications,
    dashboardStats,
    loading,
    addDriver,
    updateDriver,
    deleteDriver,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    sendNotification
  } = useDocumentSystem();

  const handleAddDriver = () => {
    setEditingDriver(null);
    setShowDriverModal(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setShowDriverModal(true);
  };

  const handleDeleteDriver = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      await deleteDriver(id);
    }
  };

  const handleSaveDriver = async (driverData: Omit<Driver, 'id' | 'createdAt' | 'documents'>) => {
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, driverData);
      } else {
        await addDriver(driverData);
      }
      setShowDriverModal(false);
      setEditingDriver(null);
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      await deleteVehicle(id);
    }
  };

  const handleSaveVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'documents'>) => {
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
      } else {
        await addVehicle(vehicleData);
      }
      setShowVehicleModal(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={dashboardStats} 
            drivers={drivers}
            vehicles={vehicles}
            onEditDriver={handleEditDriver}
            onEditVehicle={handleEditVehicle}
          />
        );
      case 'drivers':
        return (
          <DriverList
            drivers={drivers}
            onAddDriver={handleAddDriver}
            onEditDriver={handleEditDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        );
      case 'vehicles':
        return (
          <VehicleList
            vehicles={vehicles}
            onAddVehicle={handleAddVehicle}
            onEditVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        );
      case 'notifications':
        return (
          <NotificationList
            notifications={notifications}
            onSendNotification={sendNotification}
          />
        );
      case 'document-filter':
        return (
          <DocumentFilter
            drivers={drivers}
            vehicles={vehicles}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthProvider>
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50">
          <Header 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            notificationCount={notifications.filter(n => n.status === 'pending').length}
          />
          
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-center mt-2">Carregando...</p>
                </div>
              </div>
            )}
            {renderContent()}
          </main>

          {/* Driver Modal */}
          <Modal
            isOpen={showDriverModal}
            onClose={() => {
              setShowDriverModal(false);
              setEditingDriver(null);
            }}
            title={editingDriver ? 'Editar Motorista' : 'Novo Motorista'}
            size="lg"
          >
            <DriverForm
              driver={editingDriver || undefined}
              onSave={handleSaveDriver}
              onCancel={() => {
                setShowDriverModal(false);
                setEditingDriver(null);
              }}
              loading={loading}
            />
          </Modal>

          {/* Vehicle Modal */}
          <Modal
            isOpen={showVehicleModal}
            onClose={() => {
              setShowVehicleModal(false);
              setEditingVehicle(null);
            }}
            title={editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            size="lg"
          >
            <VehicleForm
              vehicle={editingVehicle || undefined}
              onSave={handleSaveVehicle}
              onCancel={() => {
                setShowVehicleModal(false);
                setEditingVehicle(null);
              }}
              loading={loading}
            />
          </Modal>
        </div>
      </AuthWrapper>
    </AuthProvider>
  );
}

export default App;