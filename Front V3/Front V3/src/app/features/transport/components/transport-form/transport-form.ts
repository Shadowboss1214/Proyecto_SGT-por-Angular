import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Transport } from '../../models/transport';
import { Component, Input, OnInit } from '@angular/core';
import { TransportService } from '../../services/transport';
import { NavigationService } from '../../../../core/services/nav.service';
import { Validators } from '@angular/forms';

/**
 * Reactive form component for creating and editing transport records.
 *
 * Uses camelCase control names internally (costPerKm, maintenanceCost, fuelConsumption)
 * and explicitly remaps them to the snake_case model fields (costperkm, maintenancecost,
 * fuelconsumption) in submit() to match the Postgres column naming convention without
 * quotes. In edit mode, patchValue() performs the inverse mapping from the model.
 *
 * Operates in two modes: without `data` it renders a blank create form; with `data`
 * it pre-populates all seven fields via a manual patchValue mapping.
 */
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
    private router: NavigationService) { }

  form!: FormGroup;

  /** Transport record to pre-populate the form in edit mode; absent for create mode. */
  @Input() data?: Transport;

  /** String primary key passed by the parent in edit mode; absent means create. */
  @Input() id?: string;

  /**
   * Builds the reactive form group with validators for all seven fields and
   * pre-populates it when `data` is provided.
   *
   * `plate` requires a minimum of 5 characters. Cost fields use a decimal pattern;
   * `fuelConsumption` uses an integer-only pattern. patchValue() maps snake_case
   * model fields to the camelCase control names.
   */
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

  /**
   * Remaps camelCase form values to the snake_case Transport model, then persists
   * via TransportService and navigates back to the transport list.
   *
   * Precondition: the form must be valid (all required fields present, plate ≥ 5 chars,
   * cost fields in decimal format, fuelConsumption as a whole number).
   * `id_transport` is set to 0 on create; the service overwrites it with a temp ID.
   */
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
