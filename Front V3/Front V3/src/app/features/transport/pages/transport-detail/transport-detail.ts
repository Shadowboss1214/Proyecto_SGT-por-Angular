import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TransportService } from '../../services/transport';
import { Transport } from '../../models/transport';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../../core/services/nav.service';
import { TransportFormComponent } from '../../components/transport-form/transport-form';

/**
 * Detail component for a single transport unit.
 * Handles three operating modes determined by the current URL:
 * - Read-only view (`/:id`)
 * - Edit mode (`/:id/edit`)
 * - Create mode (`/new`)
 */

@Component({
  selector: 'app-transport-detail',
  standalone: true,
  imports: [CommonModule, TransportFormComponent, RouterModule],
  templateUrl: './transport-detail.html',
  styleUrl: './transport-detail.css',
})
export class TransportDetailComponent implements OnInit {

  /** Transport record loaded from the service. Undefined until data is fetched */
  transport?: Transport;

  /** Whether the component is in edit or create mode */
  isEdit = false;

   /**
   * @param route   - Provides access to the current route snapshot (URL segments and params)
   * @param router  - Role-aware navigation service for redirecting after delete
   * @param service - Service that handles transport data fetching and mutations
   */
  constructor(
    private route: ActivatedRoute,
    private router: NavigationService,
    private service: TransportService
  ) {}

  /**
   * Lifecycle hook that resolves the operating mode and loads transport data.
   *
   * Reads the URL segments to determine whether the component is in
   * create (`new`), edit (`:id/edit`), or read-only (`:id`) mode.
   * Fetches the transport record from the service cache when an ID is present.
   */
  ngOnInit() {
    const id  = this.route.snapshot.paramMap.get('id');
    const url = this.route.snapshot.url.map(s => s.path);

    const isNew = url.includes('new');
    this.isEdit = url.includes('edit') || isNew;

    if (id && !isNew) {
      this.service.getLatestTransports().subscribe(() => {
        this.transport = this.service.getById(Number(id));
      });
    }
  }

   /**
   * Deletes the transport unit with the given ID and navigates back to the list.
   *
   * @param id - String representation of the transport's unique identifier
   */
  delete(id: string) {
    this.service.delete(Number(id)).subscribe(() => {
      this.router.navigate(['/transport']);
    });
  }
}
