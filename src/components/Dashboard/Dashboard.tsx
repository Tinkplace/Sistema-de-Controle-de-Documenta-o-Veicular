import React, { useState, useMemo } from 'react';
import { Users, Truck, Clock, AlertTriangle, Bell, TruckIcon, PieChart, Edit, Download, Filter } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatsCard from './StatsCard';
import Button from '../Common/Button';
import { DashboardStats, Driver, Vehicle } from '../../types';
import { formatDate, getDaysUntilExpiry, getStatusText, getDocumentTypeLabel } from '../../utils/documentHelpers';
import { exportVehicleList, exportToPDF, DocumentExportData } from '../../utils/exportHelpers';

interface DashboardProps {
  stats: DashboardStats;
  drivers: Driver[];
  vehicles: Vehicle[];
  onEditDriver?: (driver: Driver) => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  drivers, 
  vehicles, 
  onEditDriver, 
  onEditVehicle 
}) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<'cavalo_mecanico' | 'reboque' | null>(null);
  const [showLinkTypeFilter, setShowLinkTypeFilter] = useState(false);

  // Calculate vehicle type stats
  const vehicleStats = useMemo(() => {
    const cavalos = vehicles.filter(v => v.type === 'cavalo_mecanico');
    const reboques = vehicles.filter(v => v.type === 'reboque');
    
    return {
      totalCavalos: cavalos.length,
      totalReboques: reboques.length,
      cavalos,
      reboques
    };
  }, [vehicles]);

  // Calculate link type stats
  const linkTypeStats = useMemo(() => {
    const driverStats = {
      agregado: drivers.filter(d => d.linkType === 'agregado').length,
      frota: drivers.filter(d => d.linkType === 'frota').length,
      terceiro: drivers.filter(d => d.linkType === 'terceiro').length
    };
    
    const vehicleStats = {
      agregado: vehicles.filter(v => v.linkType === 'agregado').length,
      frota: vehicles.filter(v => v.linkType === 'frota').length,
      terceiro: vehicles.filter(v => v.linkType === 'terceiro').length
    };
    
    return { drivers: driverStats, vehicles: vehicleStats };
  }, [drivers, vehicles]);

  // Get all documents with enhanced information
  const getAllDocuments = () => {
    const allDocuments = [
      ...drivers.flatMap(driver => 
        driver.documents.map(doc => ({
          id: doc.id,
          entityId: driver.id,
          entityName: driver.name,
          entityType: 'Motorista' as const,
          documentType: getDocumentTypeLabel(doc.type),
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          status: doc.status,
          daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
          observations: doc.observations,
          entity: driver
        }))
      ),
      ...vehicles.flatMap(vehicle => 
        vehicle.documents.map(doc => ({
          id: doc.id,
          entityId: vehicle.id,
          entityName: `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`,
          entityType: 'Veículo' as const,
          documentType: getDocumentTypeLabel(doc.type),
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          status: doc.status,
          daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
          observations: doc.observations,
          entity: vehicle
        }))
      )
    ];

    return allDocuments.sort((a, b) => {
      // Sort by status priority (expired first, then expiring soon, then valid)
      const statusPriority = { expired: 0, expiring_soon: 1, valid: 2 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      // Then by days until expiry
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });
  };

  const handleVehicleTypeClick = (type: 'cavalo_mecanico' | 'reboque') => {
    setSelectedVehicleType(selectedVehicleType === type ? null : type);
  };

  const handleExportVehicles = (type?: 'cavalo_mecanico' | 'reboque') => {
    exportVehicleList(vehicles, type);
  };

  const handleExportByLinkType = (linkType: 'agregado' | 'frota' | 'terceiro') => {
    // Filter drivers and vehicles by link type
    const filteredDrivers = drivers.filter(d => d.linkType === linkType);
    const filteredVehicles = vehicles.filter(v => v.linkType === linkType);
    
    // Prepare export data
    const exportData: DocumentExportData[] = [];
    
    // Add driver documents
    filteredDrivers.forEach(driver => {
      driver.documents.forEach(doc => {
        exportData.push({
          id: doc.id,
          entityName: driver.name,
          entityType: 'Motorista',
          documentType: getDocumentTypeLabel(doc.type),
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          status: doc.status,
          daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
          observations: doc.observations,
          nome: driver.name,
          placa: driver.cavaloPlate || driver.carretaPlate || '-'
        });
      });
    });
    
    // Add vehicle documents
    filteredVehicles.forEach(vehicle => {
      vehicle.documents.forEach(doc => {
        exportData.push({
          id: doc.id,
          entityName: `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`,
          entityType: 'Veículo',
          documentType: getDocumentTypeLabel(doc.type),
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          status: doc.status,
          daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
          observations: doc.observations,
          nome: `${vehicle.brand} ${vehicle.model}`,
          placa: vehicle.plate
        });
      });
    });
    
    const linkTypeLabel = linkType === 'agregado' ? 'Agregados' : 
                         linkType === 'frota' ? 'Frota' : 'Terceiros';
    
    exportToPDF(exportData, `Relatório ${linkTypeLabel} - ${filteredDrivers.length} Motoristas e ${filteredVehicles.length} Veículos`);
  };

  const allDocuments = getAllDocuments();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Total de Motoristas"
          value={stats.totalDrivers}
          icon={Users}
          color="blue"
        />
        
        {/* Cavalos Mecânicos Card - Non-clickable */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cavalos Mecânicos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{vehicleStats.totalCavalos}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-700 border-blue-200">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Reboques Card - Non-clickable */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reboques</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{vehicleStats.totalReboques}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-700 border-green-200">
              <TruckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <StatsCard
          title="Próximos ao Vencimento"
          value={stats.expiringSoon}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Documentos Vencidos"
          value={stats.expiredDocuments}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Notificações Pendentes"
          value={stats.pendingNotifications}
          icon={Bell}
          color="yellow"
        />
      </div>

      {/* Link Type Statistics and Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 text-purple-600 mr-2" />
              Relatórios por Tipo de Vínculo
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLinkTypeFilter(!showLinkTypeFilter)}
            >
              {showLinkTypeFilter ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </div>
        
        {showLinkTypeFilter && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Agregados */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-purple-900">Agregados</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportByLinkType('agregado')}
                    icon={Download}
                    disabled={linkTypeStats.drivers.agregado === 0 && linkTypeStats.vehicles.agregado === 0}
                  >
                    PDF
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700">Motoristas:</span>
                    <span className="font-semibold text-purple-900">{linkTypeStats.drivers.agregado}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700">Veículos:</span>
                    <span className="font-semibold text-purple-900">{linkTypeStats.vehicles.agregado}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-800 font-medium">Total:</span>
                      <span className="font-bold text-purple-900">
                        {linkTypeStats.drivers.agregado + linkTypeStats.vehicles.agregado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frota */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-blue-900">Frota</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportByLinkType('frota')}
                    icon={Download}
                    disabled={linkTypeStats.drivers.frota === 0 && linkTypeStats.vehicles.frota === 0}
                  >
                    PDF
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Motoristas:</span>
                    <span className="font-semibold text-blue-900">{linkTypeStats.drivers.frota}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Veículos:</span>
                    <span className="font-semibold text-blue-900">{linkTypeStats.vehicles.frota}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-medium">Total:</span>
                      <span className="font-bold text-blue-900">
                        {linkTypeStats.drivers.frota + linkTypeStats.vehicles.frota}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terceiros */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-green-900">Terceiros</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportByLinkType('terceiro')}
                    icon={Download}
                    disabled={linkTypeStats.drivers.terceiro === 0 && linkTypeStats.vehicles.terceiro === 0}
                  >
                    PDF
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Motoristas:</span>
                    <span className="font-semibold text-green-900">{linkTypeStats.drivers.terceiro}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Veículos:</span>
                    <span className="font-semibold text-green-900">{linkTypeStats.vehicles.terceiro}</span>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">Total:</span>
                      <span className="font-bold text-green-900">
                        {linkTypeStats.drivers.terceiro + linkTypeStats.vehicles.terceiro}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Resumo Geral</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {drivers.length}
                    </div>
                    <div className="text-gray-600">Total Motoristas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {vehicles.length}
                    </div>
                    <div className="text-gray-600">Total Veículos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {drivers.length + vehicles.length}
                    </div>
                    <div className="text-gray-600">Total Geral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {allDocuments.length}
                    </div>
                    <div className="text-gray-600">Total Documentos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal/Section */}
      {selectedVehicleType && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {selectedVehicleType === 'cavalo_mecanico' ? (
                  <>
                    <Truck className="h-5 w-5 mr-2 text-blue-600" />
                    Cavalos Mecânicos ({vehicleStats.totalCavalos})
                  </>
                ) : (
                  <>
                    <TruckIcon className="h-5 w-5 mr-2 text-green-600" />
                    Reboques ({vehicleStats.totalReboques})
                  </>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExportVehicles(selectedVehicleType)}
                  icon={Download}
                >
                  Exportar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedVehicleType(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedVehicleType === 'cavalo_mecanico' ? vehicleStats.cavalos : vehicleStats.reboques).map((vehicle) => (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{vehicle.plate}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedVehicleType === 'cavalo_mecanico'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedVehicleType === 'cavalo_mecanico' ? 'Cavalo' : 'Reboque'}
                      </span>
                      {onEditVehicle && (
                        <button
                          onClick={() => onEditVehicle(vehicle)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar veículo"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {vehicle.brand} {vehicle.model} - {vehicle.year}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {vehicle.documents.length} documentos
                    </span>
                    <div className="flex space-x-1">
                      {vehicle.documents.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          className={`w-2 h-2 rounded-full ${
                            doc.status === 'valid' ? 'bg-green-500' :
                            doc.status === 'expiring_soon' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          title={`${getDocumentTypeLabel(doc.type)} - ${getStatusText(doc.status)}`}
                        />
                      ))}
                      {vehicle.documents.length > 3 && (
                        <span className="text-xs text-gray-400">+{vehicle.documents.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {(selectedVehicleType === 'cavalo_mecanico' ? vehicleStats.cavalos : vehicleStats.reboques).length === 0 && (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Nenhum {selectedVehicleType === 'cavalo_mecanico' ? 'cavalo mecânico' : 'reboque'} cadastrado.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 text-blue-600 mr-2" />
            Status dos Documentos
          </h3>
        </div>
        <div className="p-6">
          {allDocuments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Válidos', value: allDocuments.filter(doc => doc.status === 'valid').length, color: '#10B981' },
                    { name: 'Próximo ao Vencimento', value: allDocuments.filter(doc => doc.status === 'expiring_soon').length, color: '#F59E0B' },
                    { name: 'Vencidos', value: allDocuments.filter(doc => doc.status === 'expired').length, color: '#EF4444' }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Válidos', value: allDocuments.filter(doc => doc.status === 'valid').length, color: '#10B981' },
                    { name: 'Próximo ao Vencimento', value: allDocuments.filter(doc => doc.status === 'expiring_soon').length, color: '#F59E0B' },
                    { name: 'Vencidos', value: allDocuments.filter(doc => doc.status === 'expired').length, color: '#EF4444' }
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Nenhum documento encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;