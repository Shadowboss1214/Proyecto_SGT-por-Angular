import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsService } from '../../services/logistics';
import { ReportService } from '../../../../core/services/report.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-logistics-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './logistics-dashboard.html',
  styleUrl: './logistics-dashboard.css'
})
export class LogisticsDashboardComponent implements OnInit {

  private logisticsService = inject(LogisticsService);
  private reportService    = inject(ReportService);
  private cdr              = inject(ChangeDetectorRef);

  loading = true;
  totalIncome = 0;
  totalCost   = 0;
  profit      = 0;
  efficiency  = 0;
  totalTrips  = 0;
  insight     = '';

  private tripsByDay: Record<string, number> = {};

  columns = [
    { label: 'Métrica', field: 'metrica' },
    { label: 'Valor',   field: 'valor'   },
  ];

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [{ label: 'Finanzas', data: [0, 0] }]
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ label: 'Viajes por día', data: [] }]
  };

  ngOnInit() {
    this.logisticsService.getMetrics().subscribe({
      next: metrics => {
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
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

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

  exportPdf()   { this.reportService.exportToPdf(this.reportData, this.columns, 'Reporte de Logística'); }
  exportExcel() { this.reportService.exportToExcel(this.reportData, this.columns, 'reporte_logistica'); }
}
