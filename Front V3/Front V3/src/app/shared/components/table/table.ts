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
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;

  /** Emitted when the user clicks the view/detail action for a row. */
  @Output() view = new EventEmitter<any>();

  /** Emitted when the user clicks the edit action for a row. */
  @Output() edit = new EventEmitter<any>();

  /** Emitted when the user clicks the delete action for a row. */
  @Output() delete = new EventEmitter<any>();

  /** Emitted when the user clicks the QR action; payload is the full row object. */
  @Output() qr = new EventEmitter<any>();

  @Output() pageChange = new EventEmitter<number>();

    get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }

  prev() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  next() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  goTo(page: number) {
    this.pageChange.emit(page);
  }
}

/** Descriptor for a single column in the generic table. */
export interface TableColumn {
  /** Header text shown in the &lt;th&gt; cell. */
  label: string;
  /** Object property key used to read the cell value from each data row. */
  field: string;
}
