import { Injectable } from '@angular/core';

export interface ReportColumn {
  label: string;
  field: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  /**
   * Exporta datos a PDF usando jsPDF + autoTable.
   * Requiere: npm install jspdf jspdf-autotable
   */
  async exportToPdf(data: any[], columns: ReportColumn[], title: string): Promise<void> {
    // Importación dinámica para no aumentar el bundle inicial
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ orientation: 'landscape' });

    // Encabezado del documento
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 14, 25);

    // Construir encabezados y filas para autoTable
    const head = [columns.map(c => c.label)];
    const body = data.map(row =>
      columns.map(col => {
        const val = row[col.field];
        if (val === null || val === undefined) return '';
        // Formatear números como moneda si el campo contiene cost, income, salary, etc.
        if (typeof val === 'number' && /cost|income|salary|fuelcost/i.test(col.field)) {
          return val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
        }
        return String(val);
      })
    );

    autoTable(doc, {
      head,
      body,
      startY: 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [30, 41, 59],   // #1e293b
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249], // #f1f5f9
      },
      margin: { left: 14, right: 14 },
    });

    const filename = `${title.replace(/\s+/g, '_').toLowerCase()}_${this._timestamp()}.pdf`;
    doc.save(filename);
  }

  /**
   * Exporta datos a Excel (.xlsx) usando SheetJS (xlsx).
   * Requiere: npm install xlsx
   */
  async exportToExcel(data: any[], columns: ReportColumn[], filename: string): Promise<void> {
    const XLSX = await import('xlsx');

    // Construir array de objetos con los encabezados legibles
    const rows = data.map(row => {
      const mapped: Record<string, any> = {};
      columns.forEach(col => {
        mapped[col.label] = row[col.field] ?? '';
      });
      return mapped;
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Ajustar ancho de columnas automáticamente
    const colWidths = columns.map(col => ({
      wch: Math.max(col.label.length, 15)
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const fullFilename = `${filename}_${this._timestamp()}.xlsx`;
    XLSX.writeFile(wb, fullFilename);
  }

  private _timestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }
}