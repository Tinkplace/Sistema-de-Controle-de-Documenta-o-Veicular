import React, { useState } from 'react';
import { User, Phone, Mail, Plus, Edit, Trash2, FileText, Truck } from 'lucide-react';
import { Driver } from '../../types';
import Button from '../Common/Button';
import StatusBadge from '../Common/StatusBadge';
import { formatDate, getDocumentTypeLabel } from '../../utils/documentHelpers';

interface DriverListProps {
  drivers: Driver[];
  onAddDriver: () => void;
  onEditDriver: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
}

const DriverList: React.FC<DriverListProps> = ({
  drivers,
  onAddDriver,
  onEditDriver,
  onDeleteDriver
}) => {
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  const toggleDriverExpansion = (driverId: string) => {
    setExpandedDriver(expandedDriver === driverId ? null : driverId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Motoristas</h2>
        <Button onClick={onAddDriver} icon={Plus}>
          Novo Motorista
        </Button>
      </div>

      <div className="grid gap-6">
        {drivers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum motorista cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece adicionando o primeiro motorista ao sistema.
            </p>
            <Button onClick={onAddDriver} icon={Plus}>
              Adicionar Motorista
            </Button>
          </div>
        ) : (
          drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {driver.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {driver.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {driver.phone}
                        </div>
                      </div>
                      
                      {/* Placas dos Veículos */}
                      {(driver.cavaloPlate || driver.carretaPlate) && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          {driver.cavaloPlate && (
                            <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                              <Truck className="h-3 w-3 mr-1 text-blue-600" />
                              <span className="text-blue-700 font-medium">Cavalo: {driver.cavaloPlate}</span>
                            </div>
                          )}
                          {driver.carretaPlate && (
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                              <Truck className="h-3 w-3 mr-1 text-green-600" />
                              <span className="text-green-700 font-medium">Carreta: {driver.carretaPlate}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {driver.documents.slice(0, 3).map((doc) => (
                        <StatusBadge key={doc.id} status={doc.status} />
                      ))}
                      {driver.documents.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{driver.documents.length - 3} mais
                        </span>
                      )}
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleDriverExpansion(driver.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {expandedDriver === driver.id ? 'Ocultar' : 'Ver'} Documentos
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditDriver(driver)}
                      icon={Edit}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteDriver(driver.id)}
                      icon={Trash2}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>

                {/* Documents section */}
                {expandedDriver === driver.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      Documentos ({driver.documents.length})
                    </h4>
                    
                    {driver.documents.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Nenhum documento cadastrado para este motorista.
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {driver.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {getDocumentTypeLabel(doc.type)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Vence em: {formatDate(doc.expiryDate)}
                                </p>
                                {doc.observations && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {doc.observations}
                                  </p>
                                )}
                              </div>
                            </div>
                            <StatusBadge status={doc.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverList;