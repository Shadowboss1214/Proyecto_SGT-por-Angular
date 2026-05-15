import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Transport } from '../../models/transport';
import { Component, Input, OnInit } from '@angular/core';
import { TransportService } from '../../services';
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

  form!: any;
  @Input() data?: Transport;
  @Input() id?: string;

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      plate: ['', [Validators.required, Validators.minLength(5)]],
      status: ['', Validators.required],
      costPerKm: ['', [Validators.required, Validators.pattern("^[0-9]+(.[0-9]{1,2})?$")]],
      maintenanceCost: ['', [Validators.required, Validators.pattern("^[0-9]+(.[0-9]{1,2})?$")]],
      fuelConsumption: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
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
    const value: Transport = {
      id_transport: 0,
      name: v.name,
      type: v.type,
      plate: v.plate,
      status: v.status,
      costperkm: v.costPerKm,
      maintenancecost: v.maintenanceCost,
      fuelconsumption: v.fuelConsumption,
    };

    if (this.id) {
      this.service.update(+this.id, value);
    } else {
      this.service.create(value);
    }

    this.router.navigate(['/transport']);
  }
}