import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, FileText, User, Truck, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Driver, Vehicle, DocumentStatus } from '../../types';
import Button from '../Common/Button';
import { formatDate, getDaysUntilExpiry, getDocumentTypeLabel, getStatusText } from '../../utils/documentHelpers';
import { exportToPDF, exportToExcel, DocumentExportData } from '../../utils/exportHelpers';

interface DocumentFilterProps {
  drivers: Driver[];
  vehicles: Vehicle[];
}

interface FilterState {
  status: DocumentStatus[];
  linkType: ('agregado' | 'frota' | 'terceiro')[];
  searchTerm: string;
  sortBy: 'expiryDate' | 'entityName' | 'documentType';
  sortOrder: 'asc' | 'desc';
}

interface DocumentItem {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'Motorista' | 'Veículo';
  documentType: string;
  issueDate: string;
  expiryDate: string;
  status: DocumentStatus;
  daysUntilExpiry: number;
  observations?: string;
}

const ITEMS_PER_PAGE = 6;

const DocumentFilter: React.FC<DocumentFilterProps> = ({ drivers, vehicles }) => {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    linkType: [],
    searchTerm: '',
    sortBy: 'expiryDate',
    sortOrder: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Get all documents with enhanced information
  const allDocuments = useMemo(() => {
    const documents: DocumentItem[] = [
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
          observations: doc.observations
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
          observations: doc.observations
        }))
      )
    ];

    return documents;
  }, [drivers, vehicles]);

  // Apply filters and sorting
  const filteredDocuments = useMemo(() => {
    let filtered = allDocuments;

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(doc => filters.status.includes(doc.status));
    }

    // Apply link type filter
    if (filters.linkType.length > 0) {
      filtered = filtered.filter(doc => {
        // Find the entity (driver or vehicle) and check its linkType
        if (doc.entityType === 'Motorista') {
          const driver = drivers.find(d => d.name === doc.entityName);
          return driver && filters.linkType.includes(driver.linkType);
        } else {
          const vehicle = vehicles.find(v => `${v.brand} ${v.model} - ${v.plate}` === doc.entityName);
          return vehicle && filters.linkType.includes(vehicle.linkType);
        }
      });
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.entityName.toLowerCase().includes(searchLower) ||
        doc.documentType.toLowerCase().includes(searchLower) ||
        (doc.observations && doc.observations.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'expiryDate':
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case 'entityName':
          comparison = a.entityName.localeCompare(b.entityName);
          break;
        case 'documentType':
          comparison = a.documentType.localeCompare(b.documentType);
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allDocuments, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusToggle = (status: DocumentStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
    setCurrentPage(1);
  };

  const handleLinkTypeToggle = (linkType: 'agregado' | 'frota' | 'terceiro') => {
    setFilters(prev => ({
      ...prev,
      linkType: prev.linkType.includes(linkType)
        ? prev.linkType.filter(l => l !== linkType)
        : [...prev.linkType, linkType]
    }));
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate search delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSearching(false);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      linkType: [],
      searchTerm: '',
      sortBy: 'expiryDate',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  };

  const handleExportPDF = () => {
    const documents: DocumentExportData[] = filteredDocuments.map(doc => ({
      id: doc.id,
      entityName: doc.entityName,
      entityType: doc.entityType,
      documentType: doc.documentType,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      status: doc.status,
      daysUntilExpiry: doc.daysUntilExpiry,
      observations: doc.observations,
      // Add separated columns
      nome: doc.entityType === 'Motorista' ? doc.entityName : doc.entityName.split(' - ')[0],
      placa: doc.entityType === 'Veículo' ? doc.entityName.split(' - ')[1] || '-' : '-'
    }));
    
    exportToPDF(documents, 'Filtro de Documentos - Resultados');
  };

  const handleExportExcel = () => {
    const documents: DocumentExportData[] = filteredDocuments.map(doc => ({
      id: doc.id,
      entityName: doc.entityName,
      entityType: doc.entityType,
      documentType: doc.documentType,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      status: doc.status,
      daysUntilExpiry: doc.daysUntilExpiry,
      observations: doc.observations,
      // Add separated columns
      nome: doc.entityType === 'Motorista' ? doc.entityName : doc.entityName.split(' - ')[0],
      placa: doc.entityType === 'Veículo' ? doc.entityName.split(' - ')[1] || '-' : '-'
    }));
    
    exportToExcel(documents, 'Filtro de Documentos - Resultados');
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expiring_soon':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'expiring_soon':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'expired':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getCardBorderColor = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return 'border-l-green-500';
      case 'expiring_soon':
        return 'border-l-yellow-500';
      case 'expired':
        return 'border-l-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Filtro Avançado de Documentos</h2>
        <div className="text-sm text-gray-600">
          {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter Panel */}
          {/* Link Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Vínculo
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.linkType.includes('agregado')}
                  onChange={() => handleLinkTypeToggle('agregado')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                  Agregado
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.linkType.includes('frota')}
                  onChange={() => handleLinkTypeToggle('frota')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                  Frota
                </span>
              </label>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.linkType.includes('terceiro')}
                  onChange={() => handleLinkTypeToggle('terceiro')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                  Terceiro
                </span>
              </label>
            </div>
          </div>
        <div className="space-y-6">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Busca Geral
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar por nome, documento ou observações..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status do Documento
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes('expiring_soon')}
                    onChange={() => handleStatusToggle('expiring_soon')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Próximo ao Vencimento (30 dias)
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes('expired')}
                    onChange={() => handleStatusToggle('expired')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                    <XCircle className="h-3 w-3 mr-1" />
                    Vencido
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes('valid')}
                    onChange={() => handleStatusToggle('valid')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Válido
                  </span>
                </label>
              </div>
            </div>

            {/* Sorting Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ordenação
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ordenar por:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="expiryDate">Data de Vencimento</option>
                    <option value="entityName">Nome/Placa</option>
                    <option value="documentType">Tipo de Documento</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ordem:</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="asc">Crescente</option>
                    <option value="desc">Decrescente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSearch}
                loading={isSearching}
                icon={Search}
                variant="primary"
              >
                Buscar
              </Button>
              
              <Button
                onClick={clearFilters}
                variant="secondary"
                icon={Filter}
              >
                Limpar Filtros
              </Button>
              
              {/* ✨ MODIFICAÇÃO: Botões de exportação adicionados */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportPDF}
                  icon={Download}
                  disabled={filteredDocuments.length === 0}
                >
                  Exportar PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportExcel}
                  icon={Download}
                  disabled={filteredDocuments.length === 0}
                >
                  Exportar Excel
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-500 flex items-center space-x-4">
              <span>
                {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
              </span>
              {filters.status.length > 0 || filters.linkType.length > 0 || filters.searchTerm ? (
                <span className="text-blue-600 font-medium">
                  {filters.status.length + filters.linkType.length + (filters.searchTerm ? 1 : 0)} filtro{filters.status.length + filters.linkType.length + (filters.searchTerm ? 1 : 0) !== 1 ? 's' : ''} ativo{filters.status.length + filters.linkType.length + (filters.searchTerm ? 1 : 0) !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-gray-400">Nenhum filtro aplicado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Resultados da Busca
          </h3>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
          )}
        </div>

        {/* Document Cards Grid */}
        {paginatedDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 border-r border-t border-b border-gray-200 ${getCardBorderColor(doc.status)} hover:shadow-md transition-shadow duration-200`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {doc.entityType === 'Motorista' ? (
                        <User className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Truck className="h-5 w-5 text-green-600" />
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doc.entityType === 'Motorista' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {doc.entityType}
                      </span>
                    </div>
                    
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      <span className="ml-1">{getStatusText(doc.status)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 truncate" title={doc.entityName}>
                        {doc.entityName}
                      </h4>
                      <p className="text-sm text-gray-600">{doc.documentType}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Vence em: {formatDate(doc.expiryDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <AlertTriangle className="h-4 w-4 mr-2 text-gray-400" />
                        <span className={`font-medium ${
                          doc.daysUntilExpiry < 0 
                            ? 'text-red-600' 
                            : doc.daysUntilExpiry <= 30 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                        }`}>
                          {doc.daysUntilExpiry < 0 
                            ? `Vencido há ${Math.abs(doc.daysUntilExpiry)} dias`
                            : doc.daysUntilExpiry === 0
                              ? 'Vence hoje'
                              : `${doc.daysUntilExpiry} dias restantes`
                          }
                        </span>
                      </div>
                    </div>

                    {doc.observations && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic">
                          {doc.observations}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              icon={ChevronLeft}
            >
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              icon={ChevronRight}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentFilter;