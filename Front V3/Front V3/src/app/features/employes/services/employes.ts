import { Injectable } from '@angular/core';
import { Employee } from '../models/employee';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Controller layer for the employee domain: owns canonical in-memory state and
 * exposes reactive streams so that View components never write data directly.
 *
 * Acts as the MVC Controller in the Angular SPA: mutations flow through this
 * service, which then pushes updated snapshots via BehaviorSubject to all
 * subscribed views.
 */
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private data: Employee[] = [];

  private dataSubject = new BehaviorSubject<Employee[]>(this.data);

  /** Live stream subscribed by View components; emits the full list on every mutation. */
  data$: Observable<Employee[]> = this.dataSubject.asObservable();

  /**
   * Returns the live employee stream.
   * Subscribers receive the current snapshot immediately, then all subsequent mutations.
   * @returns Observable that never completes for the lifetime of the service.
   */
  getAll(): Observable<Employee[]> {
    return this.data$;
  }

  /**
   * Looks up a single employee by primary key in the local cache without a network call.
   * @param id - The `id_employee` value to search for.
   * @returns The matching Employee, or `undefined` if not cached.
   */
  getById(id: number): Employee | undefined {
    return this.data.find(e => e.id_employee === id);
  }

  /**
   * Appends a new employee and notifies all subscribers.
   * Assigns a temporary numeric ID (epoch seconds) to avoid collisions during the session;
   * this ID must be replaced by the real Postgres SERIAL after backend persistence.
   * @param employeeData - Employee payload; any `id_employee` value is overwritten.
   */
  create(employeeData: Employee): void {
    const newItem: Employee = {
      ...employeeData,
      id_employee: Math.floor(Date.now() / 1000)
    };

    this.data.push(newItem);
    this.refresh();
  }

  /**
   * Replaces the employee matching `id` with the supplied data, preserving the primary key.
   * No-op if `id` is not found in the local cache.
   * @param id - The `id_employee` of the record to update.
   * @param employeeData - New field values; the `id_employee` field is ignored and overridden.
   */
  update(id: number, employeeData: Employee): void {
    const index = this.data.findIndex(e => e.id_employee === id);

    if (index !== -1) {
      this.data[index] = { ...employeeData, id_employee: id };
      this.refresh();
    }
  }

  /**
   * Removes the employee matching `id` from local state.
   * No-op if `id` is not found.
   * @param id - The `id_employee` of the record to remove.
   */
  delete(id: number): void {
    this.data = this.data.filter(e => e.id_employee !== id);
    this.refresh();
  }

  /** Pushes a copy of the current array to subscribers, triggering change detection. */
  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }
}
