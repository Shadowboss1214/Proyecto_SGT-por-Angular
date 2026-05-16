import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsService } from '../../services/logistics';
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

  totalIncome = 0;
  totalCost   = 0;
  profit      = 0;
  efficiency  = 0;
  totalTrips  = 0;
  insight     = '';

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [{ label: 'Finanzas', data: [0, 0] }]
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ label: 'Viajes por día', data: [] }]
  };

  ngOnInit() {
    this.logisticsService.getMetrics().subscribe(metrics => {
      this.totalIncome = metrics.total_income;
      this.totalCost   = metrics.total_cost;
      this.profit      = metrics.profit;
      this.efficiency  = metrics.efficiency;
      this.totalTrips  = metrics.total_trips;
      this.insight     = metrics.insight;

      this.barChartData = {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{ label: 'Finanzas', data: [this.totalIncome, this.totalCost] }]
      };

      this.lineChartData = {
        labels: Object.keys(metrics.trips_by_day),
        datasets: [{ label: 'Viajes por día', data: Object.values(metrics.trips_by_day) }]
      };
    });
  }
}
