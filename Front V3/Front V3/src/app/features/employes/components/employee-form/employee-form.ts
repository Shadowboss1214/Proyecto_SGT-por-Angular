import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Employee } from '../../models/employee';
import { Component, Input, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employes';
import { NavigationService } from '../../../../core/services/nav.service';
import { Validators } from '@angular/forms';

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
    private router: NavigationService) { }

  form!: any;
  @Input() data?: Employee;
  @Input() id?: string;

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      salary: ['', [Validators.required, Validators.pattern("^[0-9]+(.[0-9]{1,2})?$")]],
      role: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

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