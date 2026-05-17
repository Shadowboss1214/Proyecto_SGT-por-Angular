import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Trip } from '../models/trips';

/**
 * Controller layer for the trip domain: owns canonical in-memory state and
 * exposes reactive streams so that View components never write data directly.
 *
 * Follows the same BehaviorSubject pattern as EmployeeService and TransportService.
 * Mutations flow through this service, which pushes updated snapshots to all
 * subscribed views.
 */
@Injectable({ providedIn: 'root' })
export class TripService {

  private data: Trip[] = [];

  private subject = new BehaviorSubject<Trip[]>(this.data);

  /** Live stream subscribed by View components; emits the full list on every mutation. */
  data$: Observable<Trip[]> = this.subject.asObservable();

  /**
   * Returns the live trip stream.
   * Subscribers receive the current snapshot immediately, then all subsequent mutations.
   * @returns Observable that never completes for the lifetime of the service.
   */
  getAll(): Observable<Trip[]> {
    return this.data$;
  }

  /**
   * Looks up a single trip by primary key in the local cache without a network call.
   * @param id - The `id_trip` value to search for.
   * @returns The matching Trip, or `undefined` if not cached.
   */
  getById(id: number): Trip | undefined {
    return this.data.find(t => t.id_trip === id);
  }

  /**
   * Appends a new trip and notifies all subscribers.
   * Assigns a temporary numeric ID (epoch seconds) to avoid collisions during the session;
   * this ID must be replaced by the real Postgres SERIAL after backend persistence.
   * @param tripData - Trip payload; any `id_trip` value is overwritten.
   */
  create(tripData: Trip): void {
    const newTrip: Trip = {
      ...tripData,
      id_trip: Math.floor(Date.now() / 1000)
    };

    this.data.push(newTrip);
    this.refresh();
  }

  /**
   * Replaces the trip matching `id` with the supplied data, preserving the primary key.
   * No-op if `id` is not found in the local cache.
   * @param id - The `id_trip` of the record to update.
   * @param tripData - New field values; `id_trip` is ignored and overridden.
   */
  update(id: number, tripData: Trip): void {
    const index = this.data.findIndex(t => t.id_trip === id);

    if (index !== -1) {
      this.data[index] = { ...tripData, id_trip: id };
      this.refresh();
    }
  }

  /**
   * Removes the trip matching `id` from local state.
   * No-op if `id` is not found.
   * @param id - The `id_trip` of the record to remove.
   */
  delete(id: number): void {
    this.data = this.data.filter(t => t.id_trip !== id);
    this.refresh();
  }

  /** Pushes a copy of the current array to subscribers, triggering change detection. */
  private refresh(): void {
    this.subject.next([...this.data]);
  }
}
