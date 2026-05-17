import { Injectable } from '@angular/core';

/** Shared column descriptor used by both exportToPdf and exportToExcel. */
export interface ReportColumn {
  /** Translated header text shown in the PDF/Excel column header. */
  label: string;
  /** Object property key used to read the cell value from each data row. */
  field: string;
}

/**
 * Central export service: generates downloadable PDF and Excel reports from
 * any filtered dataset without server involvement.
 *
 * Both methods use dynamic import so jsPDF, jspdf-autotable, and SheetJS are
 * excluded from the initial bundle and fetched on demand only when the user
 * triggers an export for the first time. Currency formatting is applied
 * automatically to any numeric field whose name matches /cost|income|salary|fuelcost/i,
 * so callers do not need to pre-format values before passing the data array.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportService {

  /**
   * Generates a landscape PDF report with title, generation timestamp, and a styled
   * autoTable, then triggers a browser download.
   *
   * Numeric fields whose names match /cost|income|salary|fuelcost/i are formatted
   * as MXN currency automatically. The output filename is derived from `title` with
   * spaces replaced by underscores and a YYYYMMdd_HHmm suffix to prevent collisions.
   * @param data - Records to export; only the fields referenced in `columns` are used.
   * @param columns - Column definitions that drive both table headers and field extraction.
   * @param title - Report heading displayed at the top and used as the filename base.
   */
  async exportToPdf(data: any[], columns: ReportColumn[], title: string): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 14, 25);

    const head = [columns.map(c => c.label)];
    const body = data.map(row =>
      columns.map(col => {
        const val = row[col.field];
        if (val === null || val === undefined) return '';
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
        fillColor: [30, 41, 59],    // #1e293b
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
   * Generates an .xlsx workbook with a single sheet named "Datos" and triggers a
   * browser download via SheetJS writeFile.
   *
   * Column headers use `col.label` (the readable display name) rather than the
   * internal field key so the spreadsheet is self-explanatory without the source code.
   * Column widths are set to max(label.length, 15) characters to prevent header truncation.
   * The filename receives a YYYYMMdd_HHmm suffix to prevent collisions.
   * @param data - Records to export.
   * @param columns - Column definitions that drive header names and field extraction.
   * @param filename - Base for the output filename, without extension or timestamp.
   */
  async exportToExcel(data: any[], columns: ReportColumn[], filename: string): Promise<void> {
    const XLSX = await import('xlsx');

    const rows = data.map(row => {
      const mapped: Record<string, any> = {};
      columns.forEach(col => {
        mapped[col.label] = row[col.field] ?? '';
      });
      return mapped;
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    const colWidths = columns.map(col => ({
      wch: Math.max(col.label.length, 15)
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const fullFilename = `${filename}_${this._timestamp()}.xlsx`;
    XLSX.writeFile(wb, fullFilename);
  }

  /** Returns a YYYYMMdd_HHmm string used to suffix output filenames and prevent collisions. */
  private _timestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }
}
