import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Trip } from '../models/trips';
import { AuthService } from '../../../core/services/auth.service';

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
  private apiUrl = 'http://localhost:8080/trips';

  private subject = new BehaviorSubject<Trip[]>(this.data);

  /** Live stream subscribed by View components; emits the full list on every mutation. */
  data$: Observable<Trip[]> = this.subject.asObservable();
  private _currentPage = 1;
  private _totalPages = 1;

  get page() { return this._currentPage; }
  get total() { return this._totalPages; }

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /** Pushes a copy of the current array to subscribers, triggering change detection. */
  private refresh(): void {
    this.subject.next([...this.data]);
  }

  /** Synchronous snapshot of the current cached list. Empty array if nothing loaded yet. */
  get snapshot(): Trip[] { return [...this.data]; }

  getAll(): Observable<Trip[]> {
    return this.data$;
  }

  getLatestTrips(page: Number = 1): Observable<Trip[]> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        const list = response._embedded?.trips || [];
        this.data = list;
        this._currentPage = response.page || page;
        this._totalPages = response.page_count || 1;
        this.refresh();
        return [...list];
      })
    );
  }

  private invalidate(): void {
    this.data = [];
  }

  getById(id: number): Observable<Trip> {
    const hit = this.data.find(t => t.id_trip === id);
    if (hit) return of(hit);
    return this.http.get<Trip>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(tripData: Trip): Observable<any> {
    const { id_trip, ...payload } = tripData;
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTrips().subscribe(); })
    );
  }

  update(id: number, tripData: Trip): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tripData, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTrips().subscribe(); })
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestTrips().subscribe(); })
    );
  }
}
