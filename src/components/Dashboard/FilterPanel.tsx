import React from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp, Calendar, User, Truck, FileText } from 'lucide-react';
import { DocumentStatus } from '../../types';
import Button from '../Common/Button';

interface FilterState {
  status: DocumentStatus[];
  entityType: ('Motorista' | 'Veículo')[];
  documentType: string[];
  searchTerm: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: any) => void;
  onClearFilters: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  availableEntities: { drivers: string[]; vehicles: string[] };
  availableDocumentTypes: string[];
  filteredCount: number;
  totalCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isExpanded,
  onToggleExpanded,
  availableDocumentTypes,
  filteredCount,
  totalCount
}) => {
  const activeFiltersCount = 
    filters.status.length + 
    filters.entityType.length + 
    filters.documentType.length +
    (filters.searchTerm ? 1 : 0);

  const handleStatusToggle = (status: DocumentStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange('status', newStatus);
  };

  const handleEntityTypeToggle = (entityType: 'Motorista' | 'Veículo') => {
    const newEntityType = filters.entityType.includes(entityType)
      ? filters.entityType.filter(e => e !== entityType)
      : [...filters.entityType, entityType];
    onFilterChange('entityType', newEntityType);
  };

  const handleDocumentTypeToggle = (docType: string) => {
    const newDocumentType = filters.documentType.includes(docType)
      ? filters.documentType.filter(d => d !== docType)
      : [...filters.documentType, docType];
    onFilterChange('documentType', newDocumentType);
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getStatusText = (status: DocumentStatus) => {
    switch (status) {
      case 'valid':
        return 'Válido';
      case 'expiring_soon':
        return 'Próximo ao Vencimento';
      case 'expired':
        return 'Vencido';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ✨ MODIFICAÇÃO: Header simplificado e mais intuitivo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleExpanded}
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {activeFiltersCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
                </span>
                <span className="text-sm text-gray-600">
                  {filteredCount} de {totalCount} documentos
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClearFilters}
                icon={X}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ✨ MODIFICAÇÃO: Interface de filtros reorganizada e mais intuitiva */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Busca Global - Posição de destaque */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-900 mb-3 flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Busca Global
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Digite nome, placa, tipo de documento ou observações..."
              />
              {filters.searchTerm && (
                <button
                  onClick={() => onFilterChange('searchTerm', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Busque por qualquer informação: nome do motorista, placa do veículo, tipo de documento ou observações
            </p>
          </div>

          {/* ✨ MODIFICAÇÃO: Filtros organizados em grid responsivo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status dos Documentos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Status dos Documentos
              </label>
              <div className="space-y-3">
                {(['valid', 'expiring_soon', 'expired'] as DocumentStatus[]).map((status) => (
                  <label key={status} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo de Entidade */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Tipo de Entidade
              </label>
              <div className="space-y-3">
                {(['Motorista', 'Veículo'] as const).map((entityType) => (
                  <label key={entityType} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.entityType.includes(entityType)}
                      onChange={() => handleEntityTypeToggle(entityType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex items-center">
                      {entityType === 'Motorista' ? (
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                      ) : (
                        <Truck className="h-4 w-4 mr-2 text-green-600" />
                      )}
                      <span className="text-sm text-gray-700">{entityType}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipos de Documento */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Tipos de Documento
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableDocumentTypes.map((docType) => (
                  <label key={docType} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.documentType.includes(docType)}
                      onChange={() => handleDocumentTypeToggle(docType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 truncate" title={docType}>
                      {docType}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ✨ MODIFICAÇÃO: Resumo de filtros ativos mais visual */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Ativos ({activeFiltersCount})
                </h4>
                <span className="text-sm text-gray-600">
                  {filteredCount} resultado{filteredCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {filters.searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Search className="h-3 w-3 mr-1" />
                    "{filters.searchTerm}"
                    <button
                      onClick={() => onFilterChange('searchTerm', '')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.status.map((status) => (
                  <span key={status} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {getStatusText(status)}
                    <button
                      onClick={() => handleStatusToggle(status)}
                      className="ml-2 hover:opacity-75"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                
                {filters.entityType.map((entityType) => (
                  <span key={entityType} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {entityType === 'Motorista' ? (
                      <User className="h-3 w-3 mr-1" />
                    ) : (
                      <Truck className="h-3 w-3 mr-1" />
                    )}
                    {entityType}
                    <button
                      onClick={() => handleEntityTypeToggle(entityType)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                
                {filters.documentType.map((docType) => (
                  <span key={docType} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <FileText className="h-3 w-3 mr-1" />
                    {docType}
                    <button
                      onClick={() => handleDocumentTypeToggle(docType)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;