export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkType: 'agregado' | 'frota' | 'terceiro';
  cavaloPlate?: string;
  carretaPlate?: string;
  createdAt: string;
  documents: DriverDocument[];
}

export interface DriverDocument {
  id: string;
  driverId: string;
  type: 'seguro_motorista' | 'cnh' | 'mopp';
  issueDate: string;
  expiryDate: string;
  status: DocumentStatus;
  fileUrl?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: 'cavalo_mecanico' | 'reboque';
  linkType: 'agregado' | 'frota' | 'terceiro';
  brand: string;
  model: string;
  year: number;
  owner: {
    name: string;
    document: string; // CPF or CNPJ
    phone: string;
    email: string;
  };
  createdAt: string;
  documents: VehicleDocument[];
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: VehicleDocumentType;
  issueDate: string;
  expiryDate: string;
  status: DocumentStatus;
  fileUrl?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export type VehicleDocumentType = 
  | 'citv' 
  | 'crlv' 
  | 'seguro_veiculo' 
  | 'relatorio_opacidade' 
  | 'relatorio_ruido' 
  | 'tacografo';

export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

export interface Notification {
  id: string;
  documentId: string;
  documentType: string;
  entityName: string;
  expiryDate: string;
  status: 'pending' | 'sent' | 'failed';
  recipients: string[];
  sentAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalDrivers: number;
  totalVehicles: number;
  validDocuments: number;
  expiringSoon: number;
  expiredDocuments: number;
  pendingNotifications: number;
}

export interface FilterOptions {
  status?: DocumentStatus[];
  documentType?: string[];
  entityType?: ('driver' | 'vehicle')[];
  dateRange?: {
    start: string;
    end: string;
  };
}