import { DocumentStatus } from '../types';

export const getDocumentStatus = (expiryDate: string): DocumentStatus => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry <= 30) {
    return 'expiring_soon';
  } else {
    return 'valid';
  }
};

export const getStatusColor = (status: DocumentStatus): string => {
  switch (status) {
    case 'valid':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'expiring_soon':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'expired':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

export const getStatusText = (status: DocumentStatus): string => {
  switch (status) {
    case 'valid':
      return 'Válido';
    case 'expiring_soon':
      return 'Próximo ao Vencimento';
    case 'expired':
      return 'Vencido';
    default:
      return 'Status Desconhecido';
  }
};

export const getDocumentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    // Driver documents
    seguro_motorista: 'Seguro do Motorista',
    cnh: 'CNH',
    mopp: 'MOPP',
    
    // Vehicle documents
    citv: 'CITV',
    crlv: 'CRLV',
    seguro_veiculo: 'Seguro do Veículo',
    relatorio_opacidade: 'Relatório de Opacidade',
    relatorio_ruido: 'Relatório de Ruído',
    tacografo: 'Tacógrafo'
  };
  
  return labels[type] || type;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const shouldSendNotification = (expiryDate: string): boolean => {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  return daysUntil === 30 || daysUntil === 15 || daysUntil === 7 || daysUntil === 1;
};