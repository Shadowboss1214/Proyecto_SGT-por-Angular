import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Transport } from '../models/transport';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

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
  private apiUrl = 'http://localhost:8080/transport';

  private dataSubject = new BehaviorSubject<Transport[]>(this.data);

  /** Live stream subscribed by View components; emits the full list on every mutation. */
  data$: Observable<Transport[]> = this.dataSubject.asObservable();
  private _currentPage = 1;
  private _totalPages = 1;

  get page() { return this._currentPage; }
  get total() { return this._totalPages; }

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /** Synchronous snapshot of the current cached list. Empty array if nothing loaded yet. */
  get snapshot(): Transport[] { return [...this.data]; }

  /**
   * Returns the live transport stream backed by `BehaviorSubject`.
   * Subscribers receive the current snapshot immediately, then all subsequent mutations.
   */
  getAll(): Observable<Transport[]> {
    return this.data$;
  }

  /**
   * Returns the cached transport if present; otherwise fetches from the API.
   * @param id - Primary key of the transport unit.
   */
  getById(id: number): Observable<Transport> {
    const hit = this.data.find(t => t.id_transport === id);
    if (hit) return of(hit);
    return this.http.get<Transport>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Synchronous cache lookup by primary key; returns `undefined` when not found.
   * Prefer `getById()` in components — this is intended for components that need
   * a result without subscribing (e.g. form pre-population before init).
   * @param id - Primary key of the transport unit.
   */
  findInCache(id: number): Transport | undefined {
    return this.data.find(t => t.id_transport === id);
  }

  /**
   * Creates a transport unit via POST, stripping `id_transport` so the database
   * generates the primary key automatically via `SERIAL` / `nextval()`.
   * Invalidates the cache and re-fetches after success.
   * @param data - Transport record to persist; `id_transport` is ignored.
   */
  create(data: Transport): Observable<any> {
    const { id_transport, ...payload } = data;
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTransports().subscribe(); })
    );
  }

  /**
   * Updates a transport unit via PATCH (partial update); strips `id_transport` from
   * the body since the ID is already in the URL. Uses PATCH rather than PUT to allow
   * the backend to apply field-level merging.
   * @param id - Primary key of the transport unit.
   * @param transportData - Full transport record (only sent fields will differ from PATCH semantics).
   */
  update(id: number, transportData: Transport): Observable<any> {
    const { id_transport, ...payload } = transportData;
    return this.http.patch<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTransports().subscribe(); })
    );
  }

  /**
   * Deletes a transport unit by ID and invalidates the cache so the list refreshes.
   * @param id - Primary key of the transport unit to delete.
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTransports().subscribe(); })
    );
  }

  /** Pushes a copy of the current array to subscribers, triggering change detection. */
  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }

  /**
   * Fetches a page of transports from the API, replaces the internal cache, and
   * updates the pagination counters. Pushes the result to all `data$` subscribers.
   * @param page - 1-based page number (defaults to 1).
   * @returns Observable emitting the fetched page as a plain array.
   */
  getLatestTransports(page: number = 1): Observable<Transport[]> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        console.log('page_count transport:', response.page_count);
        const list = response._embedded?.transport || [];
        this.data = list;
        this._currentPage = response.page || page;
        this._totalPages = response.page_count || 1;
        this.refresh();
        return [...list];
      })
    );
  }

  /**
   * Clears the in-memory cache so the next `getLatestTransports()` call hits the network.
   * Called automatically after every mutation (create, update, delete).
   */
  private invalidate(): void {
    this.data = [];
  }
}
