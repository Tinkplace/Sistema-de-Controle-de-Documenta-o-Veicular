import React, { useState } from 'react';
import { Truck, Plus, Edit, Trash2, FileText, User, Phone, Mail, CreditCard } from 'lucide-react';
import { Vehicle } from '../../types';
import Button from '../Common/Button';
import StatusBadge from '../Common/StatusBadge';
import { formatDate, getDocumentTypeLabel } from '../../utils/documentHelpers';

interface VehicleListProps {
  vehicles: Vehicle[];
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle
}) => {
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  const toggleVehicleExpansion = (vehicleId: string) => {
    setExpandedVehicle(expandedVehicle === vehicleId ? null : vehicleId);
  };

  const getVehicleTypeLabel = (type: string) => {
    return type === 'cavalo_mecanico' ? 'Cavalo Mecânico' : 'Reboque';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Veículos</h2>
        <Button onClick={onAddVehicle} icon={Plus}>
          Novo Veículo
        </Button>
      </div>

      <div className="grid gap-6">
        {vehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum veículo cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece adicionando o primeiro veículo ao sistema.
            </p>
            <Button onClick={onAddVehicle} icon={Plus}>
              Adicionar Veículo
            </Button>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      vehicle.type === 'cavalo_mecanico' 
                        ? 'bg-blue-100' 
                        : 'bg-green-100'
                    }`}>
                      <Truck className={`h-6 w-6 ${
                        vehicle.type === 'cavalo_mecanico' 
                          ? 'text-blue-600' 
                          : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.plate}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.type === 'cavalo_mecanico'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getVehicleTypeLabel(vehicle.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {vehicle.brand} {vehicle.model} - {vehicle.year}
                      </p>
                     
                     {/* Owner Information */}
                     <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                       <div className="flex items-center">
                         <User className="h-3 w-3 mr-1" />
                         {vehicle.owner.name}
                       </div>
                       <div className="flex items-center">
                         <CreditCard className="h-3 w-3 mr-1" />
                         {vehicle.owner.document}
                       </div>
                       <div className="flex items-center">
                         <Phone className="h-3 w-3 mr-1" />
                         {vehicle.owner.phone}
                       </div>
                       <div className="flex items-center">
                         <Mail className="h-3 w-3 mr-1" />
                         {vehicle.owner.email}
                       </div>
                     </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {vehicle.documents.slice(0, 3).map((doc) => (
                        <StatusBadge key={doc.id} status={doc.status} />
                      ))}
                      {vehicle.documents.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{vehicle.documents.length - 3} mais
                        </span>
                      )}
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleVehicleExpansion(vehicle.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {expandedVehicle === vehicle.id ? 'Ocultar' : 'Ver'} Documentos
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditVehicle(vehicle)}
                      icon={Edit}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteVehicle(vehicle.id)}
                      icon={Trash2}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>

                {/* Documents section */}
                {expandedVehicle === vehicle.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      Documentos ({vehicle.documents.length})
                    </h4>
                    
                    {vehicle.documents.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Nenhum documento cadastrado para este veículo.
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {vehicle.documents.map((doc) => (
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

export default VehicleList;