import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form';

/**
 * Shared view/edit/create component for the employee detail screen.
 *
 * Determines its operating mode by inspecting URL segments on init: 'new' activates
 * create mode (isEdit=true, no record loaded), ':id/edit' activates edit mode, and
 * ':id' alone renders a read-only view. Delegates form rendering to EmployeeFormComponent,
 * passing the loaded record and the primary key as @Input bindings.
 */
@Component({
  selector: 'app-Employee-detail',
  standalone: true,
  imports: [CommonModule, EmployeeFormComponent, RouterModule],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetailComponent implements OnInit {

  /** The loaded employee record; undefined in create mode or when the ID is not found. */
  employee?: Employee;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EmployeeService
  ) { }

  /** True when the view is in create-or-edit mode; false for read-only detail. */
  isEdit = false;

  /**
   * Resolves the operating mode from URL segments and loads the employee from the
   * service cache when an `id` param is present and the mode is not 'new'.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.employee = this.service.getById(Number(id));
    }
  }

  /**
   * Deletes the employee and navigates back to the list.
   * @param id - String form of the employee primary key taken from the template.
   */
  delete(id: string) {
    this.service.delete(Number(id));
    this.router.navigate(['/employee']);
  }
}
