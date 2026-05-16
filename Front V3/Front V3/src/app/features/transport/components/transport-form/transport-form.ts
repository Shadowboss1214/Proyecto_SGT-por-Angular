import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Transport } from '../../models/transport';
import { Component, Input, OnInit } from '@angular/core';
import { TransportService } from '../../services/transport';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-transport-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transport-form.html',
  styleUrl: './transport-form.css',
})
export class TransportFormComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private service: TransportService,
    private router: Router) { }

  form!: FormGroup;
  @Input() data?: Transport;
  @Input() id?: string;

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      plate: ['', [Validators.required, Validators.minLength(5)]],
      status: ['', Validators.required],
      // ✅ FIX: el punto en el regex debe escaparse para no aceptar cualquier carácter
      costPerKm: ['', [Validators.required, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")]],
      maintenanceCost: ['', [Validators.required, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")]],
      // ✅ FIX: permite decimales igual que los otros campos numéricos
      fuelConsumption: ['', [Validators.required, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")]]
    });

    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        type: this.data.type,
        plate: this.data.plate,
        status: this.data.status,
        costPerKm: this.data.costperkm,
        maintenanceCost: this.data.maintenancecost,
        fuelConsumption: this.data.fuelconsumption,
      });
    }
  }

  submit() {
    if (this.form.invalid) return;

    const v = this.form.value;

    if (this.id) {
      // ✅ UPDATE: incluye el id para identificar el registro
      const value: Transport = {
        id_transport: 0, // este campo no se envía en el UPDATE, el backend lo ignora
        name: v.name,
        type: v.type,
        plate: v.plate,
        status: v.status,
        costperkm: +v.costPerKm,
        maintenancecost: +v.maintenanceCost,
        fuelconsumption: +v.fuelConsumption,
      };

      this.service.update(+this.id, value).subscribe({
        next: () => {
          console.log('Transporte actualizado con éxito');
          this.router.navigate(['/transport']);
        },
        error: (err: any) => {
          console.error('Error al actualizar transporte - Status:', err.status);
          console.error('Detalle del servidor:', err.error);
        }
      });

    } else {
      // ✅ FIX PRINCIPAL: en el CREATE no se envía id_transport
      // para que Supabase lo genere automáticamente con nextval()
      const value: Omit<Transport, 'id_transport'> = {
        name: v.name,
        type: v.type,
        plate: v.plate,
        status: v.status,
        costperkm: +v.costPerKm,
        maintenancecost: +v.maintenanceCost,
        fuelconsumption: +v.fuelConsumption,
      };

      this.service.create(value as Transport).subscribe({
        next: () => {
          console.log('Transporte creado con éxito');
          this.router.navigate(['/transport']);
        },
        error: (err: any) => {
          console.error('❌ Error al crear transporte - Status:', err.status);
          console.error('❌ Detalle del servidor:', err.error);
        }
      });
    }
  }
}