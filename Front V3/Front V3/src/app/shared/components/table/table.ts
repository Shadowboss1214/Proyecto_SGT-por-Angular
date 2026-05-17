import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class TableComponent {

  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;

  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
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

export interface TableColumn {
  label: string;
  field: string;
}


