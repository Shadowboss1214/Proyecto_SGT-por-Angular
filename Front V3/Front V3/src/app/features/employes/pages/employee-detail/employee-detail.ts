import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/nav.service';
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
  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: NavigationService,
    private service: EmployeeService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.service.getById(Number(id)).subscribe(emp => this.employee = emp);
    }
  }

  delete(id: string) {
    this.service.delete(Number(id)).subscribe(() => {
      this.router.navigate(['/employee']);
    });
  }
}
