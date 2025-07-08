import React, { useState, useMemo } from 'react';
import { FileText, Download, User, Truck, Calendar, AlertTriangle } from 'lucide-react';
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

const DocumentReport: React.FC<DocumentReportProps> = ({ drivers, vehicles }) => {
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

  const handleExportPDF = () => {
    const exportData: DocumentExportData[] = reportData.map(item => ({
      id: item.id,
      entityName: `${item.nome} - ${item.placa}`, // Keep for compatibility
      entityType: item.entityType,
      documentType: item.documentType,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      status: item.status,
      daysUntilExpiry: item.daysUntilExpiry,
      observations: item.observations,
      // Separated columns
      nome: item.nome,
      placa: item.placa
    }));
    
    exportToPDF(exportData, 'Relatório Detalhado de Documentos');
  };

  const handleExportExcel = () => {
    const exportData: DocumentExportData[] = reportData.map(item => ({
      id: item.id,
      entityName: `${item.nome} - ${item.placa}`, // Keep for compatibility
      entityType: item.entityType,
      documentType: item.documentType,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate,
      status: item.status,
      daysUntilExpiry: item.daysUntilExpiry,
      observations: item.observations,
      // Separated columns
      nome: item.nome,
      placa: item.placa
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ✨ MODIFICAÇÃO: Header simplificado sem filtros duplicados */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Relatório Detalhado de Documentos
              </h3>
              <p className="text-sm text-gray-600">
                {reportData.length} documento{reportData.length !== 1 ? 's' : ''} cadastrado{reportData.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              icon={Download}
              disabled={reportData.length === 0}
            >
              PDF
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportExcel}
              icon={Download}
              disabled={reportData.length === 0}
            >
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {reportData.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-gray-500">
              Não há documentos cadastrados no sistema.
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
              {reportData.map((item) => (
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
      {reportData.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Total: {reportData.length} documento{reportData.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Vencidos: {reportData.filter(d => d.status === 'expired').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Próximos ao vencimento: {reportData.filter(d => d.status === 'expiring_soon').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Válidos: {reportData.filter(d => d.status === 'valid').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReport;