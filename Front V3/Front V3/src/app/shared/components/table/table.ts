import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Generic presentational table shared by every entity list view.
 *
 * Renders any array of records using a caller-supplied column definition and
 * emits action events upward so parent views retain full control of navigation
 * and mutation logic. This component deliberately owns no business logic.
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class TableComponent {

  /** Records to render; each object must expose the fields named in `columns`. */
  @Input() data: any[] = [];

  /** Column definitions that determine which fields are shown and their display labels. */
  @Input() columns: TableColumn[] = [];

  /** Emitted when the user clicks the view/detail action for a row. */
  @Output() view = new EventEmitter<any>();

  /** Emitted when the user clicks the edit action for a row. */
  @Output() edit = new EventEmitter<any>();

  /** Emitted when the user clicks the delete action for a row. */
  @Output() delete = new EventEmitter<any>();

  /** Emitted when the user clicks the QR action; payload is the full row object. */
  @Output() qr = new EventEmitter<any>();

}

/** Descriptor for a single column in the generic table. */
export interface TableColumn {
  /** Header text shown in the &lt;th&gt; cell. */
  label: string;
  /** Object property key used to read the cell value from each data row. */
  field: string;
}
