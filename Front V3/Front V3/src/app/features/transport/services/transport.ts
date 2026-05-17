import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transport } from '../models/transport';

/**
 * Controller layer for the transport domain: owns canonical in-memory state and
 * exposes reactive streams so that View components never write data directly.
 *
 * Follows the same BehaviorSubject pattern as EmployeeService and TripService.
 * Mutations flow through this service, which pushes updated snapshots to all
 * subscribed views.
 */
@Injectable({
  providedIn: 'root'
})
export class TransportService {

  private data: Transport[] = [];

  private dataSubject = new BehaviorSubject<Transport[]>(this.data);

  /** Live stream subscribed by View components; emits the full list on every mutation. */
  data$: Observable<Transport[]> = this.dataSubject.asObservable();

  /**
   * Returns the live transport stream.
   * Subscribers receive the current snapshot immediately, then all subsequent mutations.
   * @returns Observable that never completes for the lifetime of the service.
   */
  getAll(): Observable<Transport[]> {
    return this.data$;
  }

  /**
   * Looks up a single transport by primary key in the local cache without a network call.
   * @param id - The `id_transport` value to search for.
   * @returns The matching Transport, or `undefined` if not cached.
   */
  getById(id: number): Transport | undefined {
    return this.data.find(t => t.id_transport === id);
  }

  /**
   * Appends a new transport and notifies all subscribers.
   * Assigns a temporary numeric ID (epoch seconds) to avoid collisions during the session;
   * this ID must be replaced by the real Postgres SERIAL after backend persistence.
   * @param transportData - Transport payload; any `id_transport` value is overwritten.
   */
  create(transportData: Transport): void {
    const newItem: Transport = {
      ...transportData,
      id_transport: Math.floor(Date.now() / 1000)
    };

    this.data.push(newItem);
    this.refresh();
  }

  /**
   * Replaces the transport matching `id` with the supplied data, preserving the primary key.
   * No-op if `id` is not found in the local cache.
   * @param id - The `id_transport` of the record to update.
   * @param transportData - New field values; `id_transport` is ignored and overridden.
   */
  update(id: number, transportData: Transport): void {
    const index = this.data.findIndex(t => t.id_transport === id);

    if (index !== -1) {
      this.data[index] = { ...transportData, id_transport: id };
      this.refresh();
    }
  }

  /**
   * Removes the transport matching `id` from local state.
   * No-op if `id` is not found.
   * @param id - The `id_transport` of the record to remove.
   */
  delete(id: number): void {
    this.data = this.data.filter(t => t.id_transport !== id);
    this.refresh();
  }

  /** Pushes a copy of the current array to subscribers, triggering change detection. */
  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }
}
