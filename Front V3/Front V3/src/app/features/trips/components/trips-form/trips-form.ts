import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Route, Trip } from '../../models/trips';
import { Employee } from '../../../employes/models/employee';
import { Transport } from '../../../transport/models/transport';
import { TripService } from '../../services/trips';
import { TransportService } from '../../../transport/services/transport';
import { EmployeeService } from '../../../employes/services/employes';

@Component({
  selector: 'app-trips-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trips-form.html',
  styleUrl: './trips-form.css'
})
export class TripsForm implements OnInit {
  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private transportService = inject(TransportService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  @Input() data?: Trip;
  @Input() id?: number;

  transport: Transport[] = [];
  employes: Employee[] = [];
  tripRoute: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara', destine: 'Monterrey', distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey', distance: 921 },
    { id_route: 4, origin: 'Monterrey', destine: 'Tijuana', distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla', distance: 132 },
  ];

  form: FormGroup = this.fb.group({
    id_transport: [null, Validators.required],
    id_employee: [null, Validators.required],
    id_route: [null, Validators.required],
    income: [0, [Validators.required, Validators.min(0)]],
    fuelcost: [0, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required]
  });

  ngOnInit() {
    this.transportService.getAll().subscribe(data => this.transport = data);
    this.employeeService.getAll().subscribe(data => this.employes = data);

    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const v = this.form.value;
    const value: Trip = {
      id_trip: 0,
      id_transport: Number(v.id_transport),
      id_employee: Number(v.id_employee),
      id_route: Number(v.id_route),
      income: Number(v.income),
      fuelcost: Number(v.fuelcost),
      date: v.date,
    };

    if (this.id) {
      this.tripService.update(this.id, value);
    } else {
      this.tripService.create(value);
    }

    this.router.navigate(['/trips']);
  }
}
