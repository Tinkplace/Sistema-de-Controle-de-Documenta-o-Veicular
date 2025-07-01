import { Driver, Vehicle, Notification, DashboardStats } from '../types';
import { getDocumentStatus } from '../utils/documentHelpers';

export const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    createdAt: '2024-01-15T00:00:00Z',
    documents: [
      {
        id: 'd1',
        driverId: '1',
        type: 'cnh',
        issueDate: '2023-05-15',
        expiryDate: '2025-05-15',
        status: getDocumentStatus('2025-05-15'),
        fileUrl: '/documents/cnh_joao.pdf',
        observations: 'CNH categoria E',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'd2',
        driverId: '1',
        type: 'mopp',
        issueDate: '2023-08-20',
        expiryDate: '2025-02-20',
        status: getDocumentStatus('2025-02-20'),
        fileUrl: '/documents/mopp_joao.pdf',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'd3',
        driverId: '1',
        type: 'seguro_motorista',
        issueDate: '2024-01-10',
        expiryDate: '2025-01-10',
        status: getDocumentStatus('2025-01-10'),
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Maria Oliveira Costa',
    email: 'maria.oliveira@email.com',
    phone: '(11) 99999-2222',
    createdAt: '2024-02-10T00:00:00Z',
    documents: [
      {
        id: 'd4',
        driverId: '2',
        type: 'cnh',
        issueDate: '2022-10-05',
        expiryDate: '2024-12-25',
        status: getDocumentStatus('2024-12-25'),
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z'
      },
      {
        id: 'd5',
        driverId: '2',
        type: 'mopp',
        issueDate: '2023-06-15',
        expiryDate: '2026-06-15',
        status: getDocumentStatus('2026-06-15'),
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z'
      }
    ]
  }
];

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plate: 'ABC-1234',
    type: 'cavalo_mecanico',
    brand: 'Scania',
    model: 'R450',
    year: 2020,
    createdAt: '2024-01-20T00:00:00Z',
    documents: [
      {
        id: 'v1',
        vehicleId: '1',
        type: 'crlv',
        issueDate: '2024-01-15',
        expiryDate: '2025-01-15',
        status: getDocumentStatus('2025-01-15'),
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v2',
        vehicleId: '1',
        type: 'citv',
        issueDate: '2023-12-10',
        expiryDate: '2024-12-10',
        status: getDocumentStatus('2024-12-10'),
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v3',
        vehicleId: '1',
        type: 'seguro_veiculo',
        issueDate: '2024-03-01',
        expiryDate: '2025-03-01',
        status: getDocumentStatus('2025-03-01'),
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v4',
        vehicleId: '1',
        type: 'tacografo',
        issueDate: '2023-11-20',
        expiryDate: '2024-11-20',
        status: getDocumentStatus('2024-11-20'),
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    plate: 'DEF-5678',
    type: 'reboque',
    brand: 'Librelato',
    model: 'Graneleira',
    year: 2019,
    createdAt: '2024-02-05T00:00:00Z',
    documents: [
      {
        id: 'v5',
        vehicleId: '2',
        type: 'crlv',
        issueDate: '2023-08-15',
        expiryDate: '2024-08-15',
        status: getDocumentStatus('2024-08-15'),
        createdAt: '2024-02-05T00:00:00Z',
        updatedAt: '2024-02-05T00:00:00Z'
      },
      {
        id: 'v6',
        vehicleId: '2',
        type: 'citv',
        issueDate: '2024-01-10',
        expiryDate: '2025-01-10',
        status: getDocumentStatus('2025-01-10'),
        createdAt: '2024-02-05T00:00:00Z',
        updatedAt: '2024-02-05T00:00:00Z'
      }
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    documentId: 'd4',
    documentType: 'CNH',
    entityName: 'Maria Oliveira Costa',
    expiryDate: '2024-12-25',
    status: 'pending',
    recipients: ['admin@empresa.com', 'maria.oliveira@email.com'],
    createdAt: '2024-11-25T00:00:00Z'
  },
  {
    id: '2',
    documentId: 'v2',
    documentType: 'CITV',
    entityName: 'Cavalo Scania ABC-1234',
    expiryDate: '2024-12-10',
    status: 'sent',
    recipients: ['admin@empresa.com'],
    sentAt: '2024-11-10T00:00:00Z',
    createdAt: '2024-11-10T00:00:00Z'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalDrivers: 2,
  totalVehicles: 2,
  validDocuments: 8,
  expiringSoon: 2,
  expiredDocuments: 1,
  pendingNotifications: 1
};