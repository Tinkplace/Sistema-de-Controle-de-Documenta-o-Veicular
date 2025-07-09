import { Driver, Vehicle, Notification, DashboardStats } from '../types';
import { getDocumentStatus } from '../utils/documentHelpers';

// ✨ MODIFICAÇÃO: Dados atualizados para refletir distribuição realística de documentos
// 📊 Distribuição: 20% vencidos, 30% próximos ao vencimento, 50% vigentes

export const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    cavaloPlate: 'ABC-1234',
    carretaPlate: 'DEF-5678',
    createdAt: '2024-01-15T00:00:00Z',
    documents: [
      {
        id: 'd1',
        driverId: '1',
        type: 'cnh',
        issueDate: '2023-05-15',
        expiryDate: '2025-05-15', // ✅ VIGENTE
        status: getDocumentStatus('2025-05-15'),
        fileUrl: '/documents/cnh_joao.pdf',
        observations: 'CNH categoria E - 12345678901',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'd2',
        driverId: '1',
        type: 'mopp',
        issueDate: '2023-08-20',
        expiryDate: '2024-11-20', // ❌ VENCIDO
        status: getDocumentStatus('2024-11-20'),
        fileUrl: '/documents/mopp_joao.pdf',
        observations: 'MOPP para produtos perigosos',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 'd3',
        driverId: '1',
        type: 'seguro_motorista',
        issueDate: '2024-01-10',
        expiryDate: '2024-12-20', // ⚠️ PRÓXIMO AO VENCIMENTO
        status: getDocumentStatus('2024-12-20'),
        observations: 'Seguro de vida e acidentes pessoais',
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
    cavaloPlate: 'GHI-9012',
    createdAt: '2024-02-10T00:00:00Z',
    documents: [
      {
        id: 'd4',
        driverId: '2',
        type: 'cnh',
        issueDate: '2022-10-05',
        expiryDate: '2024-12-15', // ⚠️ PRÓXIMO AO VENCIMENTO
        status: getDocumentStatus('2024-12-15'),
        observations: 'CNH categoria D - 98765432109',
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z'
      },
      {
        id: 'd5',
        driverId: '2',
        type: 'mopp',
        issueDate: '2023-06-15',
        expiryDate: '2026-06-15', // ✅ VIGENTE
        status: getDocumentStatus('2026-06-15'),
        observations: 'MOPP renovado recentemente',
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z'
      },
      {
        id: 'd6',
        driverId: '2',
        type: 'seguro_motorista',
        issueDate: '2023-03-01',
        expiryDate: '2024-10-15', // ❌ VENCIDO
        status: getDocumentStatus('2024-10-15'),
        observations: 'Seguro vencido - necessária renovação urgente',
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'Carlos Roberto Ferreira',
    email: 'carlos.ferreira@email.com',
    phone: '(11) 99999-3333',
    cavaloPlate: 'JKL-3456',
    carretaPlate: 'MNO-7890',
    createdAt: '2024-03-05T00:00:00Z',
    documents: [
      {
        id: 'd7',
        driverId: '3',
        type: 'cnh',
        issueDate: '2024-01-20',
        expiryDate: '2029-01-20', // ✅ VIGENTE
        status: getDocumentStatus('2029-01-20'),
        observations: 'CNH categoria E - 11223344556',
        createdAt: '2024-03-05T00:00:00Z',
        updatedAt: '2024-03-05T00:00:00Z'
      },
      {
        id: 'd8',
        driverId: '3',
        type: 'mopp',
        issueDate: '2024-02-10',
        expiryDate: '2024-12-25', // ⚠️ PRÓXIMO AO VENCIMENTO
        status: getDocumentStatus('2024-12-25'),
        observations: 'MOPP válido até final do ano',
        createdAt: '2024-03-05T00:00:00Z',
        updatedAt: '2024-03-05T00:00:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'Ana Paula Rodrigues',
    email: 'ana.rodrigues@email.com',
    phone: '(11) 99999-4444',
    cavaloPlate: 'PQR-1122',
    createdAt: '2024-04-12T00:00:00Z',
    documents: [
      {
        id: 'd9',
        driverId: '4',
        type: 'cnh',
        issueDate: '2023-08-15',
        expiryDate: '2028-08-15', // ✅ VIGENTE
        status: getDocumentStatus('2028-08-15'),
        observations: 'CNH categoria E - 66778899001',
        createdAt: '2024-04-12T00:00:00Z',
        updatedAt: '2024-04-12T00:00:00Z'
      },
      {
        id: 'd10',
        driverId: '4',
        type: 'seguro_motorista',
        issueDate: '2023-05-01',
        expiryDate: '2024-09-30', // ❌ VENCIDO
        status: getDocumentStatus('2024-09-30'),
        observations: 'Seguro vencido há alguns meses',
        createdAt: '2024-04-12T00:00:00Z',
        updatedAt: '2024-04-12T00:00:00Z'
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
    owner: {
      name: 'João Silva Santos',
      document: '123.456.789-01',
      phone: '(11) 99999-1111',
      email: 'joao.silva@email.com'
    },
    createdAt: '2024-01-20T00:00:00Z',
    documents: [
      {
        id: 'v1',
        vehicleId: '1',
        type: 'crlv',
        issueDate: '2024-01-15',
        expiryDate: '2025-01-15', // ✅ VIGENTE
        status: getDocumentStatus('2025-01-15'),
        observations: 'CRLV em dia',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v2',
        vehicleId: '1',
        type: 'citv',
        issueDate: '2023-12-10',
        expiryDate: '2024-12-10', // ⚠️ PRÓXIMO AO VENCIMENTO
        status: getDocumentStatus('2024-12-10'),
        observations: 'CITV próximo ao vencimento',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v3',
        vehicleId: '1',
        type: 'seguro_veiculo',
        issueDate: '2024-03-01',
        expiryDate: '2025-03-01', // ✅ VIGENTE
        status: getDocumentStatus('2025-03-01'),
        observations: 'Seguro renovado recentemente',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v4',
        vehicleId: '1',
        type: 'tacografo',
        issueDate: '2023-11-20',
        expiryDate: '2024-11-20', // ❌ VENCIDO
        status: getDocumentStatus('2024-11-20'),
        observations: 'Tacógrafo vencido - necessária calibração',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v5',
        vehicleId: '1',
        type: 'relatorio_opacidade',
        issueDate: '2024-06-01',
        expiryDate: '2025-06-01', // ✅ VIGENTE
        status: getDocumentStatus('2025-06-01'),
        observations: 'Laudo de opacidade aprovado',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'v6',
        vehicleId: '1',
        type: 'relatorio_ruido',
        issueDate: '2024-05-15',
        expiryDate: '2024-12-30', // ⚠️ PRÓXIMO AO VENCIMENTO
        status: getDocumentStatus('2024-12-30'),
        observations: 'Laudo de ruído válido até fim do ano',
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
    owner: {
      name: 'Transportes Silva Ltda',
      document: '12.345.678/0001-90',
      phone: '(11) 3333-4444',
      email: 'contato@transportessilva.com.br'
    },
    createdAt: '2024-02-05T00:00:00Z',
    documents: [
      {
        id: 'v7',
        vehicleId: '2',
        type: 'crlv',
        issueDate: '2023-08-15',
        expiryDate: '2024-08-15', // ❌ VENCIDO
        status: getDocumentStatus('2024-08-15'),
        observations: 'CRLV vencido - renovação pendente',
        createdAt: '2024-02-05T00:00:00Z',
        updatedAt: '2024-02-05T00:00:00Z'
      },
      {
        id: 'v8',
        vehicleId: '2',
        type: 'citv',
        issueDate: '2024-01-10',
        expiryDate: '2025-01-10', // ✅ VIGENTE
        status: getDocumentStatus('2025-01-10'),
        observations: 'CITV renovado no início do ano',
        createdAt: '2024-02-05T00:00:00Z',
        updatedAt: '2024-02-05T00:00:00Z'
      },
      {
        id: 'v9',
        vehicleId: '2',
        type: 'seguro_veiculo',
        issueDate: '2024-07-01',
        expiryDate: '2024-12-28', // ⚠️ PRÓXIMO AO VENCIMENTO
        status: getDocumentStatus('2024-12-28'),
        observations: 'Seguro próximo ao vencimento',
        createdAt: '2024-02-05T00:00:00Z',
        updatedAt: '2024-02-05T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    plate: 'GHI-9012',
    type: 'cavalo_mecanico',
    brand: 'Volvo',
    model: 'FH540',
    year: 2021,
    owner: {
      name: 'Maria Oliveira Costa',
      document: '987.654.321-00',
      phone: '(11) 99999-2222',
      email: 'maria.oliveira@email.com'
    },
    createdAt: '2024-03-15T00:00:00Z',
    documents: [
      {
        id: 'v10',
        vehicleId: '3',
        type: 'crlv',
        issueDate: '2024-02-20',
        expiryDate: '2025-02-20', // ✅ VIGENTE
        status: getDocumentStatus('2025-02-20'),
        observations: 'CRLV atualizado',
        createdAt: '2024-03-15T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z'
      },
      {
        id: 'v11',
        vehicleId: '3',
        type: 'citv',
        issueDate: '2024-08-01',
        expiryDate: '2024-12-18', // ⚠️ PRÓXIMO AO VENCIMENTO
        status: getDocumentStatus('2024-12-18'),
        observations: 'CITV vence em dezembro',
        createdAt: '2024-03-15T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z'
      },
      {
        id: 'v12',
        vehicleId: '3',
        type: 'seguro_veiculo',
        issueDate: '2024-04-10',
        expiryDate: '2025-04-10', // ✅ VIGENTE
        status: getDocumentStatus('2025-04-10'),
        observations: 'Seguro com cobertura completa',
        createdAt: '2024-03-15T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z'
      },
      {
        id: 'v13',
        vehicleId: '3',
        type: 'tacografo',
        issueDate: '2023-09-15',
        expiryDate: '2024-09-15', // ❌ VENCIDO
        status: getDocumentStatus('2024-09-15'),
        observations: 'Tacógrafo vencido - calibração urgente',
        createdAt: '2024-03-15T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z'
      }
    ]
  },
  {
    id: '4',
    plate: 'JKL-3456',
    type: 'cavalo_mecanico',
    brand: 'Mercedes',
    model: 'Actros',
    year: 2022,
    owner: {
      name: 'Logística Ferreira S.A.',
      document: '98.765.432/0001-10',
      phone: '(11) 4444-5555',
      email: 'admin@logisticaferreira.com.br'
    },
    createdAt: '2024-04-20T00:00:00Z',
    documents: [
      {
        id: 'v14',
        vehicleId: '4',
        type: 'crlv',
        issueDate: '2024-03-01',
        expiryDate: '2025-03-01', // ✅ VIGENTE
        status: getDocumentStatus('2025-03-01'),
        observations: 'CRLV novo veículo',
        createdAt: '2024-04-20T00:00:00Z',
        updatedAt: '2024-04-20T00:00:00Z'
      },
      {
        id: 'v15',
        vehicleId: '4',
        type: 'seguro_veiculo',
        issueDate: '2024-01-15',
        expiryDate: '2025-01-15', // ✅ VIGENTE
        status: getDocumentStatus('2025-01-15'),
        observations: 'Seguro zero km',
        createdAt: '2024-04-20T00:00:00Z',
        updatedAt: '2024-04-20T00:00:00Z'
      }
    ]
  }
];

// ✨ MODIFICAÇÃO: Notificações atualizadas para refletir os novos dados
export const mockNotifications: Notification[] = [
  {
    id: '1',
    documentId: 'd4',
    documentType: 'CNH',
    entityName: 'Maria Oliveira Costa',
    expiryDate: '2024-12-15',
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
  },
  {
    id: '3',
    documentId: 'd8',
    documentType: 'MOPP',
    entityName: 'Carlos Roberto Ferreira',
    expiryDate: '2024-12-25',
    status: 'pending',
    recipients: ['admin@empresa.com', 'carlos.ferreira@email.com'],
    createdAt: '2024-11-28T00:00:00Z'
  },
  {
    id: '4',
    documentId: 'v6',
    documentType: 'Relatório de Ruído',
    entityName: 'Cavalo Scania ABC-1234',
    expiryDate: '2024-12-30',
    status: 'pending',
    recipients: ['admin@empresa.com'],
    createdAt: '2024-11-30T00:00:00Z'
  }
];

// ✨ MODIFICAÇÃO: Stats atualizadas automaticamente pelo sistema baseadas nos novos dados
export const mockDashboardStats: DashboardStats = {
  totalDrivers: 4,
  totalVehicles: 4,
  validDocuments: 10, // Será recalculado automaticamente
  expiringSoon: 6,    // Será recalculado automaticamente
  expiredDocuments: 4, // Será recalculado automaticamente
  pendingNotifications: 3
};