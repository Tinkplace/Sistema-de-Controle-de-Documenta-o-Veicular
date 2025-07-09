import React, { useState, useEffect } from 'react';
import { Truck, Save, X, FileText, Calendar, Shield, Gauge, Volume2, Eye, User, Phone, Mail, CreditCard } from 'lucide-react';
import { Vehicle, VehicleDocument } from '../../types';
import Button from '../Common/Button';
import { getDocumentStatus } from '../../utils/documentHelpers';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSave: (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    plate: vehicle?.plate || '',
    type: vehicle?.type || 'cavalo_mecanico' as const,
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    owner: {
      name: vehicle?.owner?.name || '',
      document: vehicle?.owner?.document || '',
      phone: vehicle?.owner?.phone || '',
      email: vehicle?.owner?.email || ''
    }
  });

  // Initialize documents based on vehicle type and existing data
  const initializeDocuments = (vehicleType: 'cavalo_mecanico' | 'reboque', existingVehicle?: Vehicle) => {
    const baseDocuments = {
      citv: {
        issueDate: existingVehicle?.documents.find(d => d.type === 'citv')?.issueDate || '',
        expiryDate: existingVehicle?.documents.find(d => d.type === 'citv')?.expiryDate || '',
        observations: existingVehicle?.documents.find(d => d.type === 'citv')?.observations || ''
      },
      crlv: {
        issueDate: existingVehicle?.documents.find(d => d.type === 'crlv')?.issueDate || '',
        expiryDate: existingVehicle?.documents.find(d => d.type === 'crlv')?.expiryDate || '',
        observations: existingVehicle?.documents.find(d => d.type === 'crlv')?.observations || ''
      },
      seguro_veiculo: {
        issueDate: existingVehicle?.documents.find(d => d.type === 'seguro_veiculo')?.issueDate || '',
        expiryDate: existingVehicle?.documents.find(d => d.type === 'seguro_veiculo')?.expiryDate || '',
        observations: existingVehicle?.documents.find(d => d.type === 'seguro_veiculo')?.observations || ''
      }
    };

    if (vehicleType === 'cavalo_mecanico') {
      return {
        ...baseDocuments,
        relatorio_opacidade: {
          issueDate: existingVehicle?.documents.find(d => d.type === 'relatorio_opacidade')?.issueDate || '',
          expiryDate: existingVehicle?.documents.find(d => d.type === 'relatorio_opacidade')?.expiryDate || '',
          observations: existingVehicle?.documents.find(d => d.type === 'relatorio_opacidade')?.observations || ''
        },
        relatorio_ruido: {
          issueDate: existingVehicle?.documents.find(d => d.type === 'relatorio_ruido')?.issueDate || '',
          expiryDate: existingVehicle?.documents.find(d => d.type === 'relatorio_ruido')?.expiryDate || '',
          observations: existingVehicle?.documents.find(d => d.type === 'relatorio_ruido')?.observations || ''
        },
        tacografo: {
          issueDate: existingVehicle?.documents.find(d => d.type === 'tacografo')?.issueDate || '',
          expiryDate: existingVehicle?.documents.find(d => d.type === 'tacografo')?.expiryDate || '',
          observations: existingVehicle?.documents.find(d => d.type === 'tacografo')?.observations || ''
        }
      };
    }

    return baseDocuments;
  };

  const [documents, setDocuments] = useState(() => initializeDocuments(formData.type, vehicle));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update documents when vehicle type changes, but preserve existing data when editing
  useEffect(() => {
    if (!vehicle) {
      // Only reset documents if we're creating a new vehicle
      setDocuments(initializeDocuments(formData.type));
    } else {
      // When editing, preserve existing data but add/remove fields based on type
      setDocuments(initializeDocuments(formData.type, vehicle));
    }
  }, [formData.type, vehicle]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação dados básicos
    if (!formData.plate.trim()) {
      newErrors.plate = 'Placa é obrigatória';
    } else if (!/^[A-Z]{3}-\d{4}$/.test(formData.plate.toUpperCase())) {
      newErrors.plate = 'Formato: ABC-1234';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Ano inválido';
    }

    // Validação dados do proprietário
    if (!formData.owner.name.trim()) {
      newErrors.ownerName = 'Nome do proprietário é obrigatório';
    }

    if (!formData.owner.document.trim()) {
      newErrors.ownerDocument = 'CPF/CNPJ é obrigatório';
    } else {
      // Basic CPF/CNPJ format validation
      const cleanDoc = formData.owner.document.replace(/\D/g, '');
      if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        newErrors.ownerDocument = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos';
      }
    }

    if (!formData.owner.phone.trim()) {
      newErrors.ownerPhone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.owner.phone)) {
      newErrors.ownerPhone = 'Formato: (11) 99999-9999';
    }

    if (!formData.owner.email.trim()) {
      newErrors.ownerEmail = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.owner.email)) {
      newErrors.ownerEmail = 'Email inválido';
    }
    // Validação datas dos documentos
    Object.entries(documents).forEach(([docType, docData]) => {
      if (docData.issueDate && docData.expiryDate) {
        const issueDate = new Date(docData.issueDate);
        const expiryDate = new Date(docData.expiryDate);
        
        if (issueDate >= expiryDate) {
          newErrors[`${docType}Dates`] = 'Data de validade deve ser posterior à data de emissão';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const vehicleDocuments: VehicleDocument[] = [];
      const now = new Date().toISOString();

      // Adicionar documentos apenas se tiverem dados
      Object.entries(documents).forEach(([docType, docData]) => {
        if (docData.issueDate && docData.expiryDate) {
          const existingDoc = vehicle?.documents.find(d => d.type === docType as any);
          
          vehicleDocuments.push({
            id: existingDoc?.id || `${docType}_${Date.now()}_${Math.random()}`,
            vehicleId: vehicle?.id || '',
            type: docType as any,
            issueDate: docData.issueDate,
            expiryDate: docData.expiryDate,
            status: getDocumentStatus(docData.expiryDate),
            observations: docData.observations,
            createdAt: existingDoc?.createdAt || now,
            updatedAt: now
          });
        }
      });

      onSave({
        ...formData,
        plate: formData.plate.toUpperCase(),
        documents: vehicleDocuments
      });
    }
  };

  const handlePlateChange = (value: string) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    let formatted = '';
    if (clean.length >= 3) {
      formatted = clean.slice(0, 3);
      if (clean.length >= 4) {
        formatted += '-' + clean.slice(3, 7);
      }
    } else {
      formatted = clean;
    }
    
    setFormData(prev => ({ ...prev, plate: formatted }));
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    let formatted = '';
    if (digits.length >= 2) {
      formatted = `(${digits.slice(0, 2)})`;
      if (digits.length >= 3) {
        formatted += ` ${digits.slice(2, digits.length <= 10 ? 6 : 7)}`;
        if (digits.length >= 7) {
          formatted += `-${digits.slice(digits.length <= 10 ? 6 : 7, 11)}`;
        }
      }
    } else {
      formatted = digits;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      owner: { ...prev.owner, phone: formatted }
    }));
  };

  const handleDocumentChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    let formatted = '';
    if (digits.length <= 11) {
      // CPF format: 123.456.789-01
      if (digits.length >= 3) {
        formatted = digits.slice(0, 3);
        if (digits.length >= 6) {
          formatted += '.' + digits.slice(3, 6);
          if (digits.length >= 9) {
            formatted += '.' + digits.slice(6, 9);
            if (digits.length >= 11) {
              formatted += '-' + digits.slice(9, 11);
            }
          }
        }
      } else {
        formatted = digits;
      }
    } else {
      // CNPJ format: 12.345.678/0001-90
      formatted = digits.slice(0, 2);
      if (digits.length >= 5) {
        formatted += '.' + digits.slice(2, 5);
        if (digits.length >= 8) {
          formatted += '.' + digits.slice(5, 8);
          if (digits.length >= 12) {
            formatted += '/' + digits.slice(8, 12);
            if (digits.length >= 14) {
              formatted += '-' + digits.slice(12, 14);
            }
          }
        }
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      owner: { ...prev.owner, document: formatted }
    }));
  };

  const handleVehicleDocumentChange = (docType: string, field: string, value: string) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const getVehicleTypeLabel = () => {
    return formData.type === 'cavalo_mecanico' ? 'Cavalo Mecânico' : 'Reboque';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dados Básicos do Veículo */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Truck className="h-5 w-5 mr-2" />
          Dados do Veículo
        </h3>
        
        <div className="grid gap-4">
          {/* Placa */}
          <div>
            <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-2">
              Placa *
            </label>
            <input
              type="text"
              id="plate"
              value={formData.plate}
              onChange={(e) => handlePlateChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.plate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ABC-1234"
              maxLength={8}
            />
            {errors.plate && (
              <p className="mt-1 text-sm text-red-600">{errors.plate}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Veículo *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'cavalo_mecanico' | 'reboque' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cavalo_mecanico">Cavalo Mecânico</option>
              <option value="reboque">Reboque</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Marca */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.brand ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Scania, Volvo, Mercedes"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
              )}
            </div>

            {/* Modelo */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.model ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: R450, FH540"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model}</p>
              )}
            </div>

            {/* Ano */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Ano *
              </label>
              <input
                type="number"
                id="year"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Documentos do {getVehicleTypeLabel()}
        </h3>

        {/* CITV */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-md font-semibold text-blue-900 mb-4 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            CITV {formData.type === 'cavalo_mecanico' ? 'Cavalo' : 'Carreta'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Emissão
              </label>
              <input
                type="date"
                value={documents.citv?.issueDate || ''}
                onChange={(e) => handleVehicleDocumentChange('citv', 'issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Validade
              </label>
              <input
                type="date"
                value={documents.citv?.expiryDate || ''}
                onChange={(e) => handleVehicleDocumentChange('citv', 'expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {errors.citvDates && (
            <p className="mt-2 text-sm text-red-600">{errors.citvDates}</p>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={documents.citv?.observations || ''}
              onChange={(e) => handleVehicleDocumentChange('citv', 'observations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Informações adicionais sobre o CITV"
            />
          </div>
        </div>

        {/* CRLV */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h4 className="text-md font-semibold text-green-900 mb-4 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            CRLV {formData.type === 'cavalo_mecanico' ? 'Cavalo' : 'Carreta'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Emissão
              </label>
              <input
                type="date"
                value={documents.crlv?.issueDate || ''}
                onChange={(e) => handleVehicleDocumentChange('crlv', 'issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Validade
              </label>
              <input
                type="date"
                value={documents.crlv?.expiryDate || ''}
                onChange={(e) => handleVehicleDocumentChange('crlv', 'expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {errors.crlvDates && (
            <p className="mt-2 text-sm text-red-600">{errors.crlvDates}</p>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={documents.crlv?.observations || ''}
              onChange={(e) => handleVehicleDocumentChange('crlv', 'observations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Informações adicionais sobre o CRLV"
            />
          </div>
        </div>

        {/* Seguro do Veículo */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h4 className="text-md font-semibold text-purple-900 mb-4 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Seguro {formData.type === 'cavalo_mecanico' ? 'Cavalo' : 'Carreta'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Emissão
              </label>
              <input
                type="date"
                value={documents.seguro_veiculo?.issueDate || ''}
                onChange={(e) => handleVehicleDocumentChange('seguro_veiculo', 'issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Validade
              </label>
              <input
                type="date"
                value={documents.seguro_veiculo?.expiryDate || ''}
                onChange={(e) => handleVehicleDocumentChange('seguro_veiculo', 'expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {errors.seguro_veiculoDates && (
            <p className="mt-2 text-sm text-red-600">{errors.seguro_veiculoDates}</p>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={documents.seguro_veiculo?.observations || ''}
              onChange={(e) => handleVehicleDocumentChange('seguro_veiculo', 'observations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Informações adicionais sobre o seguro"
            />
          </div>
        </div>

        {/* Documentos específicos para Cavalo Mecânico */}
        {formData.type === 'cavalo_mecanico' && (
          <>
            {/* Laudo de Opacidade */}
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h4 className="text-md font-semibold text-orange-900 mb-4 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Laudo de Opacidade
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={documents.relatorio_opacidade?.issueDate || ''}
                    onChange={(e) => handleDocumentChange('relatorio_opacidade', 'issueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={documents.relatorio_opacidade?.expiryDate || ''}
                    onChange={(e) => handleDocumentChange('relatorio_opacidade', 'expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {errors.relatorio_opacidadeDates && (
                <p className="mt-2 text-sm text-red-600">{errors.relatorio_opacidadeDates}</p>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={documents.relatorio_opacidade?.observations || ''}
                  onChange={(e) => handleDocumentChange('relatorio_opacidade', 'observations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Informações adicionais sobre o laudo de opacidade"
                />
              </div>
            </div>

            {/* Laudo de Ruído */}
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h4 className="text-md font-semibold text-red-900 mb-4 flex items-center">
                <Volume2 className="h-4 w-4 mr-2" />
                Laudo de Ruído
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={documents.relatorio_ruido?.issueDate || ''}
                    onChange={(e) => handleDocumentChange('relatorio_ruido', 'issueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={documents.relatorio_ruido?.expiryDate || ''}
                    onChange={(e) => handleDocumentChange('relatorio_ruido', 'expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {errors.relatorio_ruidoDates && (
                <p className="mt-2 text-sm text-red-600">{errors.relatorio_ruidoDates}</p>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={documents.relatorio_ruido?.observations || ''}
                  onChange={(e) => handleDocumentChange('relatorio_ruido', 'observations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Informações adicionais sobre o laudo de ruído"
                />
              </div>
            </div>

            {/* Tacógrafo */}
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <h4 className="text-md font-semibold text-indigo-900 mb-4 flex items-center">
                <Gauge className="h-4 w-4 mr-2" />
                Tacógrafo
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={documents.tacografo?.issueDate || ''}
                    onChange={(e) => handleDocumentChange('tacografo', 'issueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={documents.tacografo?.expiryDate || ''}
                    onChange={(e) => handleDocumentChange('tacografo', 'expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {errors.tacografoDates && (
                <p className="mt-2 text-sm text-red-600">{errors.tacografoDates}</p>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={documents.tacografo?.observations || ''}
                  onChange={(e) => handleDocumentChange('tacografo', 'observations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Informações adicionais sobre o tacógrafo"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          icon={X}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={Save}
        >
          {vehicle ? 'Atualizar' : 'Cadastrar'} Veículo
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;