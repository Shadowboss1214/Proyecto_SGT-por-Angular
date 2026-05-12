import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms'; // <-- IMPORTANTE
import { Route, Trip } from '../../models/trips';
import { Employee } from '../../../employes/models/employee';
import { Transport } from '../../../transport/models/transport';

@Component({
  selector: 'app-trips-form',
  standalone: true,
  // Agrega ReactiveFormsModule aquí para que reconozca [formGroup]
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './trips-form.html',
  styleUrl: './trips-form.css'
})
export class TripsForm implements OnInit {
  private fb = inject(FormBuilder);

  @Input() data?: Trip;
  @Input() id?: number;

  // Declarar las variables que usa el HTML
  transport: Transport[] = [];
  employes: Employee[] = [];
  tripRoute: Route[] = []; // <-- Este faltaba (Error TS2339)

  form: FormGroup = this.fb.group({
    id_transport: [null, Validators.required],
    id_employee: [null, Validators.required],
    id_route: [null, Validators.required],
    income: [0, [Validators.required, Validators.min(0)]],
    fuelcost: [0, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required]
  });

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  // Cambiamos el nombre para que coincida con el (ngSubmit)="onSubmit()"
  onSubmit() {
    if (this.form.valid) {
      console.log('Datos del viaje:', this.form.value);
      // Aquí llamarías a tu servicio para guardar
    }
  }
}