import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Employee } from '../../models/employee';
import { Component, Input, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employes';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';

/**
 * Reactive form component for creating and editing employee records.
 *
 * Operates in two modes driven by @Input: without `data` it renders a blank create
 * form; with `data` it pre-populates fields via patchValue() for editing.
 * The `salary` field enforces a numeric pattern allowing up to two decimal places
 * so malformed input is rejected at the form level before reaching the service.
 */
@Component({
  selector: 'app-Employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeFormComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private service: EmployeeService,
    private router: Router) { }

  form!: any;

  /** Employee record to pre-populate the form in edit mode; absent for create mode. */
  @Input() data?: Employee;

  /** String primary key passed by the parent in edit mode; absent means create. */
  @Input() id?: string;

  /**
   * Builds the reactive form group with validators and pre-populates it when `data`
   * is provided. `salary` uses Validators.pattern to reject non-numeric or malformed
   * decimal input before the value reaches EmployeeService.
   */
  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      salary: ['', [Validators.required, Validators.pattern("^[0-9]+(.[0-9]{1,2})?$")]],
    });
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  /**
   * Persists the form value via EmployeeService and navigates back to the list.
   *
   * Precondition: the form must be valid (name required; salary numeric with ≤2 decimals).
   * Calls update() when `id` is set (edit mode) or create() otherwise (create mode).
   */
  submit() {
    if (this.form.invalid) return;

    const value = this.form.value as Employee;

    if (this.id) {
      this.service.update(+this.id, value);
    } else {
      this.service.create(value);
    }

    this.router.navigate(['/employee']);
  }
}
