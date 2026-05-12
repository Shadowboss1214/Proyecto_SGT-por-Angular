import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripService } from '../../../trips/services/trips';
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
  

  private tripService = inject(TripService);

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        label: 'Finanzas',
        data: [0, 0]
      }
    ]
  };
  trips: any[] = [];

  totalIncome = 0;
  totalCost = 0;
  profit = 0;
  totalTrips = 0;

  ngOnInit() {
    this.tripService.getAll().subscribe(trips => {
      this.trips = trips;
      this.calculateMetrics();
    });
  }

  calculateMetrics() {

  this.totalTrips = this.trips.length;

  this.totalIncome = this.trips.reduce((sum, t) => sum + t.income, 0);

  this.totalCost = this.trips.reduce((sum, t) => sum + t.fuelCost, 0);

  this.profit = this.totalIncome - this.totalCost;

  this.barChartData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        label: 'Finanzas',
        data: [this.totalIncome, this.totalCost]
      }
    ]
  };

  this.generateTripsChart();
}

  lineChartData: ChartConfiguration<'line'>['data'] = {
  labels: [],
  datasets: [
    {
      label: 'Viajes',
      data: []
    }
  ]
};

generateTripsChart() {
  const map: any = {};

  this.trips.forEach(t => {
    const date = t.date;

    if (!map[date]) {
      map[date] = 0;
    }

    map[date]++;
  });

  this.lineChartData = {
    labels: Object.keys(map),
    datasets: [
      {
        label: 'Viajes por día',
        data: Object.values(map)
      }
    ]
  };
}
  get efficiency() {
    if (!this.totalCost) return 0;
    return (this.profit / this.totalCost) * 100;
  }

  get insight(): string {
    if (this.profit < 0) {
      return 'Estás perdiendo dinero en operaciones';
    }

    if (this.efficiency < 20) {
      return 'Baja eficiencia operativa';
    }

    return 'Operación saludable';
  }
}