import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface DocumentExportData {
  id: string;
  entityName: string;
  entityType: string;
  documentType: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  daysUntilExpiry: number;
  observations?: string;
}

export const exportToPDF = (documents: DocumentExportData[], title: string = 'Relatório de Documentos') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
  
  // Prepare table data
  const tableData = documents.map(doc => [
    doc.entityName,
    doc.entityType,
    doc.documentType,
    new Date(doc.issueDate).toLocaleDateString('pt-BR'),
    new Date(doc.expiryDate).toLocaleDateString('pt-BR'),
    doc.status === 'valid' ? 'Válido' : 
    doc.status === 'expiring_soon' ? 'Próximo ao Vencimento' : 'Vencido',
    doc.daysUntilExpiry.toString(),
    doc.observations || ''
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Nome/Placa', 'Tipo', 'Documento', 'Emissão', 'Validade', 'Status', 'Dias', 'Observações']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 15 },
      7: { cellWidth: 30 }
    }
  });
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (documents: DocumentExportData[], title: string = 'Relatório de Documentos') => {
  // Prepare data for Excel
  const excelData = documents.map(doc => ({
    'Nome/Placa': doc.entityName,
    'Tipo': doc.entityType,
    'Documento': doc.documentType,
    'Data de Emissão': new Date(doc.issueDate).toLocaleDateString('pt-BR'),
    'Data de Validade': new Date(doc.expiryDate).toLocaleDateString('pt-BR'),
    'Status': doc.status === 'valid' ? 'Válido' : 
              doc.status === 'expiring_soon' ? 'Próximo ao Vencimento' : 'Vencido',
    'Dias até Vencimento': doc.daysUntilExpiry,
    'Observações': doc.observations || ''
  }));
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 25 }, // Nome/Placa
    { wch: 15 }, // Tipo
    { wch: 25 }, // Documento
    { wch: 15 }, // Data de Emissão
    { wch: 15 }, // Data de Validade
    { wch: 20 }, // Status
    { wch: 15 }, // Dias até Vencimento
    { wch: 30 }  // Observações
  ];
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Documentos');
  
  // Save the file
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportVehicleList = (vehicles: any[], type?: 'cavalo_mecanico' | 'reboque') => {
  const filteredVehicles = type ? vehicles.filter(v => v.type === type) : vehicles;
  const title = type ? 
    (type === 'cavalo_mecanico' ? 'Relatório de Cavalos Mecânicos' : 'Relatório de Reboques') :
    'Relatório de Veículos';
  
  const vehicleData = filteredVehicles.map(vehicle => ({
    'Placa': vehicle.plate,
    'Tipo': vehicle.type === 'cavalo_mecanico' ? 'Cavalo Mecânico' : 'Reboque',
    'Marca': vehicle.brand,
    'Modelo': vehicle.model,
    'Ano': vehicle.year,
    'Total de Documentos': vehicle.documents.length,
    'Documentos Válidos': vehicle.documents.filter((d: any) => d.status === 'valid').length,
    'Próximos ao Vencimento': vehicle.documents.filter((d: any) => d.status === 'expiring_soon').length,
    'Vencidos': vehicle.documents.filter((d: any) => d.status === 'expired').length,
    'Data de Cadastro': new Date(vehicle.createdAt).toLocaleDateString('pt-BR')
  }));
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(vehicleData);
  
  // Set column widths
  const colWidths = [
    { wch: 12 }, // Placa
    { wch: 15 }, // Tipo
    { wch: 15 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 8 },  // Ano
    { wch: 18 }, // Total de Documentos
    { wch: 18 }, // Documentos Válidos
    { wch: 20 }, // Próximos ao Vencimento
    { wch: 12 }, // Vencidos
    { wch: 15 }  // Data de Cadastro
  ];
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Veículos');
  
  // Save the file
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};