import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employes';
import { Employee } from '../../models/employee';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/nav.service';
import { EmployeeFormComponent } from '../../components/employee-form/employee-form';

@Component({
  selector: 'app-Employee-detail',
  standalone: true,
  imports: [CommonModule, EmployeeFormComponent, RouterModule],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetailComponent implements OnInit {

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
