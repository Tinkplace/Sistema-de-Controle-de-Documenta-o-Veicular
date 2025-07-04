import React, { useState, useMemo } from 'react';
import { FileText, Download, User, Truck, Calendar, AlertTriangle, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Driver, Vehicle, DocumentStatus } from '../../types';
import Button from '../Common/Button';
import { formatDate, getDaysUntilExpiry, getDocumentTypeLabel, getStatusText } from '../../utils/documentHelpers';
import { exportToPDF, exportToExcel, DocumentExportData } from '../../utils/exportHelpers';

interface DocumentReportProps {
  drivers: Driver[];
  vehicles: Vehicle[];
}

interface ReportItem {
  id: string;
  nome: string;
  placa: string;
  entityType: 'Motorista' | 'Veículo';
  documentType: string;
  issueDate: string;
  expiryDate: string;
  status: DocumentStatus;
  daysUntilExpiry: number;
  observations?: string;
}

interface FilterState {
  status: DocumentStatus[];
  entityType: ('Motorista' | 'Veículo')[];
  searchTerm: string;
}

const DocumentReport: React.FC<DocumentReportProps> = ({ drivers, vehicles }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    entityType: [],
    searchTerm: ''
  });

  // Generate report data with separated name and plate columns
  const reportData = useMemo(() => {
    const data: ReportItem[] = [];

    // Add driver documents
    drivers.forEach(driver => {
      driver.documents.forEach(doc => {
        data.push({
          id: doc.id,
          nome: driver.name,
          placa: driver.cavaloPlate || driver.carretaPlate || '-',
          entityType: 'Motorista',
          documentType: getDocumentTypeLabel(doc.type),
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          status: doc.status,
          daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
          observations: doc.observations
        });
      });
    });

    // Add vehicle documents
    vehicles.forEach(vehicle => {
      vehicle.documents.forEach(doc => {
        data.push({
          id: doc.id,
          nome: `${vehicle.brand} ${vehicle.model}`,
          placa: vehicle.plate,
          entityType: 'Veículo',
          documentType: getDocumentTypeLabel(doc.type),
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          status: doc.status,
          daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
          observations: doc.observations
        });
      });
    });

    return data.sort((a, b) => {
      // Sort by status priority (expired first, then expiring soon, then valid)
      const statusPriority = { expired: 0, expiring_soon: 1, valid: 2 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      // Then by days until expiry
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });
  }, [drivers, vehicles]);

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = reportData;

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
    }

    // Apply entity type filter
    if (filters.entityType.length > 0) {
      filtered = filtered.filter(item => filters.entityType.includes(item.entityType));
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(searchLower) ||
        item.placa.toLowerCase().includes(searchLower) ||
        item.documentType.toLowerCase().includes(searchLower) ||
        (item.observations && item.observations.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [reportData, filters]);

  const handleStatusToggle = (status: DocumentStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleEntityTypeToggle = (entityType: 'Motorista' | 'Veículo') => {
    setFilters(prev => ({
      ...prev,
      entityType: prev.entityType.includes(entityType)
        ? prev.entityType.filter(e => e !== entityType)
        : [...prev.entityType, entityType]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      entityType: [],
      searchTerm: ''
    });
  };

  const handleExportPDF = () => {
    const exportData: DocumentExportData[] = filteredData.map(item => ({
      id: item.id,
      entityName: `${item.nome} (${item.placa})`,
      entityType: item.entityType,
      documentType: item.documentType,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      status: item.status,
      daysUntilExpiry: item.daysUntilExpiry,
      observations: item.observations
    }));
    
    exportToPDF(exportData, 'Relatório Detalhado de Documentos');
  };

  const handleExportExcel = () => {
    const exportData: DocumentExportData[] = filteredData.map(item => ({
      id: item.id,
      entityName: `${item.nome} (${item.placa})`,
      entityType: item.entityType,
      documentType: item.documentType,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      status: item.status,
      daysUntilExpiry: item.daysUntilExpiry,
      observations: item.observations
    }));
    
    exportToExcel(exportData, 'Relatório Detalhado de Documentos');
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return 'text-green-700 bg-green-50';
      case 'expiring_soon':
        return 'text-yellow-700 bg-yellow-50';
      case 'expired':
        return 'text-red-700 bg-red-50';
    }
  };

  const getRowBorderColor = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return 'border-l-green-500';
      case 'expiring_soon':
        return 'border-l-yellow-500';
      case 'expired':
        return 'border-l-red-500';
    }
  };

  const activeFiltersCount = filters.status.length + filters.entityType.length + (filters.searchTerm ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Relatório Detalhado de Documentos
              </h3>
              <p className="text-sm text-gray-600">
                {filteredData.length} documento{filteredData.length !== 1 ? 's' : ''} 
                {activeFiltersCount > 0 && ` (${reportData.length} total)`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
            >
              Filtros
              {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              icon={Download}
              disabled={filteredData.length === 0}
            >
              PDF
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportExcel}
              icon={Download}
              disabled={filteredData.length === 0}
            >
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar por nome, placa, documento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {(['valid', 'expiring_soon', 'expired'] as DocumentStatus[]).map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {getStatusText(status)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Entity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="space-y-2">
                  {(['Motorista', 'Veículo'] as const).map((entityType) => (
                    <label key={entityType} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.entityType.includes(entityType)}
                        onChange={() => handleEntityTypeToggle(entityType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {entityType}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                disabled={activeFiltersCount === 0}
              >
                Limpar Filtros
              </Button>
              
              <span className="text-sm text-gray-600">
                {filteredData.length} de {reportData.length} documentos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-gray-500">
              {activeFiltersCount > 0 
                ? 'Tente ajustar os filtros aplicados.'
                : 'Não há documentos cadastrados no sistema.'
              }
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Validade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dias Restantes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-gray-50 border-l-4 ${getRowBorderColor(item.status)}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.entityType === 'Motorista' ? (
                        <User className="h-5 w-5 text-blue-600 mr-2" />
                      ) : (
                        <Truck className="h-5 w-5 text-green-600 mr-2" />
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.entityType === 'Motorista' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.entityType}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.nome}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {item.placa}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.documentType}
                    </div>
                    {item.observations && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.observations}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(item.expiryDate)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <AlertTriangle className="h-4 w-4 mr-2 text-gray-400" />
                      <span className={`font-medium ${
                        item.daysUntilExpiry < 0 
                          ? 'text-red-600' 
                          : item.daysUntilExpiry <= 30 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {item.daysUntilExpiry < 0 
                          ? `${Math.abs(item.daysUntilExpiry)} dias atrás`
                          : item.daysUntilExpiry === 0
                            ? 'Hoje'
                            : `${item.daysUntilExpiry} dias`
                        }
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filteredData.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Total: {filteredData.length} documento{filteredData.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Vencidos: {filteredData.filter(d => d.status === 'expired').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Próximos ao vencimento: {filteredData.filter(d => d.status === 'expiring_soon').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Válidos: {filteredData.filter(d => d.status === 'valid').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReport;