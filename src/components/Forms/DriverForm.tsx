import React, { useState } from 'react';
import { User, Mail, Phone, Save, X, FileText, Calendar, CreditCard } from 'lucide-react';
import { Driver, DriverDocument } from '../../types';
import Button from '../Common/Button';
import { getDocumentStatus } from '../../utils/documentHelpers';

interface DriverFormProps {
  driver?: Driver;
  onSave: (driverData: Omit<Driver, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DriverForm: React.FC<DriverFormProps> = ({
  driver,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: driver?.name || '',
    email: driver?.email || '',
    phone: driver?.phone || ''
  });

  const [documents, setDocuments] = useState({
    seguro_motorista: {
      issueDate: driver?.documents.find(d => d.type === 'seguro_motorista')?.issueDate || '',
      expiryDate: driver?.documents.find(d => d.type === 'seguro_motorista')?.expiryDate || '',
      observations: driver?.documents.find(d => d.type === 'seguro_motorista')?.observations || ''
    },
    cnh: {
      number: driver?.documents.find(d => d.type === 'cnh')?.observations || '',
      issueDate: driver?.documents.find(d => d.type === 'cnh')?.issueDate || '',
      expiryDate: driver?.documents.find(d => d.type === 'cnh')?.expiryDate || '',
      observations: ''
    },
    mopp: {
      issueDate: driver?.documents.find(d => d.type === 'mopp')?.issueDate || '',
      expiryDate: driver?.documents.find(d => d.type === 'mopp')?.expiryDate || '',
      observations: driver?.documents.find(d => d.type === 'mopp')?.observations || ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação dados pessoais
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Formato: (11) 99999-9999';
    }

    // Validação CNH
    if (!documents.cnh.number.trim()) {
      newErrors.cnhNumber = 'Número da CNH é obrigatório';
    } else if (documents.cnh.number.length < 11) {
      newErrors.cnhNumber = 'CNH deve ter 11 dígitos';
    }

    if (!documents.cnh.issueDate) {
      newErrors.cnhIssueDate = 'Data de emissão da CNH é obrigatória';
    }

    if (!documents.cnh.expiryDate) {
      newErrors.cnhExpiryDate = 'Data de validade da CNH é obrigatória';
    }

    // Validação datas
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
      const driverDocuments: DriverDocument[] = [];
      const now = new Date().toISOString();

      // Adicionar documentos apenas se tiverem dados
      Object.entries(documents).forEach(([docType, docData]) => {
        if (docData.issueDate && docData.expiryDate) {
          const existingDoc = driver?.documents.find(d => d.type === docType as any);
          
          driverDocuments.push({
            id: existingDoc?.id || `${docType}_${Date.now()}`,
            driverId: driver?.id || '',
            type: docType as 'seguro_motorista' | 'cnh' | 'mopp',
            issueDate: docData.issueDate,
            expiryDate: docData.expiryDate,
            status: getDocumentStatus(docData.expiryDate),
            observations: docType === 'cnh' ? documents.cnh.number : docData.observations,
            createdAt: existingDoc?.createdAt || now,
            updatedAt: now
          });
        }
      });

      onSave({
        ...formData,
        documents: driverDocuments
      });
    }
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
    
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleCnhNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    setDocuments(prev => ({
      ...prev,
      cnh: { ...prev.cnh, number: digits.slice(0, 11) }
    }));
  };

  const handleDocumentChange = (docType: keyof typeof documents, field: string, value: string) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dados Pessoais */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Dados Pessoais
        </h3>
        
        <div className="grid gap-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite o nome completo do motorista"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="exemplo@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Telefone *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Documentos
        </h3>

        {/* CNH */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-md font-semibold text-blue-900 mb-4 flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            CNH (Carteira Nacional de Habilitação) *
          </h4>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da CNH *
              </label>
              <input
                type="text"
                value={documents.cnh.number}
                onChange={(e) => handleCnhNumberChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cnhNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="12345678901"
                maxLength={11}
              />
              {errors.cnhNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cnhNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data de Emissão *
                </label>
                <input
                  type="date"
                  value={documents.cnh.issueDate}
                  onChange={(e) => handleDocumentChange('cnh', 'issueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cnhIssueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.cnhIssueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.cnhIssueDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data de Validade *
                </label>
                <input
                  type="date"
                  value={documents.cnh.expiryDate}
                  onChange={(e) => handleDocumentChange('cnh', 'expiryDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cnhExpiryDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.cnhExpiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.cnhExpiryDate}</p>
                )}
              </div>
            </div>
            {errors.cnhDates && (
              <p className="text-sm text-red-600">{errors.cnhDates}</p>
            )}
          </div>
        </div>

        {/* Seguro do Motorista */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h4 className="text-md font-semibold text-green-900 mb-4 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Seguro do Motorista
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Emissão
              </label>
              <input
                type="date"
                value={documents.seguro_motorista.issueDate}
                onChange={(e) => handleDocumentChange('seguro_motorista', 'issueDate', e.target.value)}
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
                value={documents.seguro_motorista.expiryDate}
                onChange={(e) => handleDocumentChange('seguro_motorista', 'expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {errors.seguro_motoristaDates && (
            <p className="mt-2 text-sm text-red-600">{errors.seguro_motoristaDates}</p>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={documents.seguro_motorista.observations}
              onChange={(e) => handleDocumentChange('seguro_motorista', 'observations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Informações adicionais sobre o seguro"
            />
          </div>
        </div>

        {/* MOPP */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h4 className="text-md font-semibold text-yellow-900 mb-4 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            MOPP (Movimentação Operacional de Produtos Perigosos)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data de Emissão
              </label>
              <input
                type="date"
                value={documents.mopp.issueDate}
                onChange={(e) => handleDocumentChange('mopp', 'issueDate', e.target.value)}
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
                value={documents.mopp.expiryDate}
                onChange={(e) => handleDocumentChange('mopp', 'expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {errors.moppDates && (
            <p className="mt-2 text-sm text-red-600">{errors.moppDates}</p>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={documents.mopp.observations}
              onChange={(e) => handleDocumentChange('mopp', 'observations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Informações adicionais sobre o MOPP"
            />
          </div>
        </div>
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
          {driver ? 'Atualizar' : 'Cadastrar'} Motorista
        </Button>
      </div>
    </form>
  );
};

export default DriverForm;