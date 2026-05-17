import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsService } from '../../services/logistics';
import { ReportService } from '../../../../core/services/report.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';
Chart.register(...registerables);

/**
 * Logistics dashboard component that displays financial and operational metrics.
 * Renders a bar chart comparing income vs costs, a line chart of daily trips,
 * and a summary table exportable as PDF or Excel.
 */

@Component({
  selector: 'app-logistics-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './logistics-dashboard.html',
  styleUrl: './logistics-dashboard.css'
})
export class LogisticsDashboardComponent implements OnInit {

 /** Service that fetches computed logistics metrics from the API */
  private logisticsService = inject(LogisticsService);

  /** Service used to export report data to PDF and Excel formats */
  private reportService = inject(ReportService);

  /** Angular change detector used to force view update after async data load */
  private cdr = inject(ChangeDetectorRef);

  /** Total income across all trips */
  totalIncome = 0;

  /** Total cost across all trips (fuel + maintenance) */
  totalCost = 0;

  /** Net profit calculated as `totalIncome - totalCost` */
  profit = 0;

  /** Operational efficiency percentage */
  efficiency = 0;

  /** Total number of trips registered in the system */
  totalTrips = 0;

  /** AI or computed insight message summarizing the logistics performance */
  insight = '';

  private tripsByDay: Record<string, number> = {};

  columns = [
    { label: 'Métrica', field: 'metrica' },
    { label: 'Valor',   field: 'valor'   },
  ];

   /**
   * Configuration data for the bar chart comparing total income vs total costs.
   * Updated after metrics are loaded from the API.
   */
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [{ label: 'Finanzas', data: [0, 0] }]
  };

   /**
   * Configuration data for the line chart showing trip volume per day.
   * Labels are dates and data points are trip counts.
   * Updated after metrics are loaded from the API.
   */
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ label: 'Viajes por día', data: [] }]
  };

   /**
   * Lifecycle hook that fetches logistics metrics on component initialization.
   * Populates all stat properties and updates both chart datasets.
   * Triggers manual change detection after the async operation completes.
   */
  ngOnInit() {
    this.logisticsService.getMetrics().subscribe(metrics => {
      this.totalIncome = metrics.total_income;
      this.totalCost   = metrics.total_cost;
      this.profit      = metrics.profit;
      this.efficiency  = metrics.efficiency;
      this.totalTrips  = metrics.total_trips;
      this.insight     = metrics.insight;
      this.tripsByDay  = metrics.trips_by_day ?? {};

      this.barChartData = {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{ label: 'Finanzas', data: [this.totalIncome, this.totalCost] }]
      };

      this.lineChartData = {
        labels: Object.keys(metrics.trips_by_day),
        datasets: [{ label: 'Viajes por día', data: Object.values(metrics.trips_by_day) }]
      };
    });
    this.cdr.detectChanges();
  }

   /**
   * Builds the report data array from the current metrics.
   * Formats monetary values as MXN currency and appends one row per day in `tripsByDay`.
   *
   * @returns Array of `{ metrica, valor }` rows ready for PDF or Excel export
   */
  get reportData() {
    const fmt = (v: number) => v.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    const rows: { metrica: string; valor: string }[] = [
      { metrica: 'Ingresos Totales', valor: fmt(this.totalIncome) },
      { metrica: 'Gastos Totales',   valor: fmt(this.totalCost)   },
      { metrica: 'Utilidad',         valor: fmt(this.profit)      },
      { metrica: 'Eficiencia',       valor: `${this.efficiency.toFixed(2)} %` },
      { metrica: 'Total de Viajes',  valor: String(this.totalTrips) },
      ...Object.entries(this.tripsByDay).map(([date, count]) => ({
        metrica: `Viajes ${date}`,
        valor: String(count),
      })),
    ];
    return rows;
  }

    /**
   * Exports the current logistics report data to a PDF file.
   * Uses `ReportService` with the computed `reportData` rows and column definitions.
   */
  exportPdf(): void {
    this.reportService.exportToPdf(this.reportData, this.columns, 'Reporte de Logística');
  }

   /**
   * Exports the current logistics report data to an Excel (.xlsx) file.
   * Uses `ReportService` with the computed `reportData` rows and column definitions.
   */
  exportExcel(): void {
    this.reportService.exportToExcel(this.reportData, this.columns, 'reporte_logistica');
  }


}
