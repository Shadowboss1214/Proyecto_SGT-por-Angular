import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { CommonModule } from '@angular/common';
import { TransportFormComponent } from '../../components/transport-form/transport-form';

@Component({
  selector: 'app-transport-detail',
  standalone: true,
  imports: [CommonModule, TransportFormComponent, RouterModule],
  templateUrl: './transport-detail.html',
  styleUrl: './transport-detail.css',
})
export class TransportDetailComponent implements OnInit {

  transport?: Transport;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: TransportService
  ) { }

  isEdit = false;

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  const url = this.route.snapshot.url.map(s => s.path);

  const isNew = url.includes('new');
  this.isEdit = url.includes('edit') || isNew;

  if (id && !isNew) {
    this.transport = this.service.getById(Number(id));
  }
}

delete(id: string){
  this.service.delete(Number(id));
  this.router.navigate(['/transport']);
}
}
