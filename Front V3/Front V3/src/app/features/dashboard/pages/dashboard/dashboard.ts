import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  role = inject(ActivatedRoute). pathFromRoot.map(r => r.snapshot.data['role'])
    .find(role => !!role) as 'admin' | 'driver';

  statsAdmin = [
    { title: 'Vehículos activos', value: 24 },
    { title: 'Rutas en curso', value: 8 },
    { title: 'Entregas hoy', value: 15 },
    { title: 'Mantenimientos pendientes', value: 3 }
  ];

    statsDriver = [
    { title: 'Empleado', value: 'Joaquin Vargez'  },
    { title: 'Ultima Ruta', value: 'Cancun' },
    { title: 'Fecha de ultima ruta', value: '15/08/25' }
  ];

  stats = this.role === 'admin' ? this.statsAdmin : this.statsDriver;

}