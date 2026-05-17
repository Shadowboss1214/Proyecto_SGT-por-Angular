import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavigationService } from '../../../../core/services/nav.service';
import { Route, Trip } from '../../models/trips';
import { Employee } from '../../../employes/models/employee';
import { Transport } from '../../../transport/models/transport';
import { TripService } from '../../services/trips';
import { TransportService } from '../../../transport/services/transport';
import { EmployeeService } from '../../../employes/services/employes';

/**
 * Form component for creating and editing trip records.
 * Loads available transports and employees from their respective services,
 * and provides a static list of predefined routes for selection.
 * Operates in create mode when no `id` is provided, and edit mode otherwise.
 */
@Component({
  selector: 'app-trips-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trips-form.html',
  styleUrl: './trips-form.css'
})
export class TripsForm implements OnInit {
    /** FormBuilder used to construct the reactive form */
  private fb = inject(FormBuilder);

  /** Service for trip CRUD operations */
  private tripService = inject(TripService);

  /** Service for fetching available transport units */
  private transportService = inject(TransportService);

  /** Service for fetching available employees */
  private employeeService = inject(EmployeeService);

  /** Role-aware navigation service for redirecting after form submission */
  private router = inject(NavigationService);

  /** Trip data to pre-populate the form in edit mode. Undefined in create mode */
  @Input() data?: Trip;

  /** ID of the trip being edited. Undefined in create mode */
  @Input() id?: number;

  /** List of available transport units populated from `TransportService` */
  transport: Transport[] = [];

  /** List of available employees populated from `EmployeeService` */
  employes: Employee[] = [];

  /**
   * Static list of predefined routes available for trip assignment.
   * Each route includes origin, destination and distance in kilometers.
   */
  tripRoute: Route[] = [
    { id_route: 1, origin: 'Ciudad de México', destine: 'Guadalajara', distance: 541 },
    { id_route: 2, origin: 'Guadalajara', destine: 'Monterrey', distance: 742 },
    { id_route: 3, origin: 'Ciudad de México', destine: 'Monterrey', distance: 921 },
    { id_route: 4, origin: 'Monterrey', destine: 'Tijuana', distance: 1891 },
    { id_route: 5, origin: 'Ciudad de México', destine: 'Puebla', distance: 132 },
  ];


   /**
   * Reactive form group for the trip entity.
   * All fields are required; `income` and `fuelcost` must be non-negative numbers.
   */
  form: FormGroup = this.fb.group({
    id_transport: [null, Validators.required],
    id_employee: [null, Validators.required],
    id_route: [null, Validators.required],
    income: [0, [Validators.required, Validators.min(0)]],
    fuelcost: [0, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required]
  });

  /**
   * Lifecycle hook that initializes the form with available data.
   * Fetches transports and employees in parallel, then subscribes to their
   * reactive streams to populate the select options.
   * If `data` is provided, pre-populates the form for edit mode.
   */
  ngOnInit() {
    this.transportService.getLatestTransports().subscribe();
    this.employeeService.getLatestEmployees().subscribe();
    this.transportService.getAll().subscribe(data => this.transport = data);
    this.employeeService.getAll().subscribe(data => this.employes = data);

    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  /**
   * Handles form submission for both create and edit modes.
   * Casts all numeric fields explicitly to avoid string coercion from form controls.
   * Navigates back to the trips list after a successful operation.
   *
   * @remarks
   * - If `id` is defined, calls `TripService.update()` (edit mode).
   * - Otherwise, calls `TripService.create()` (create mode).
   */
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
      this.tripService.update(this.id, value).subscribe(() => {
        this.router.navigate(['/trips']);
      });
    } else {
      this.tripService.create(value).subscribe(() => {
        this.router.navigate(['/trips']);
      });
    }
  }
}
