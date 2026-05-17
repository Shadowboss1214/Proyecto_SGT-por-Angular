import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Trip } from '../models/trips';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class TripService {

  private data: Trip[] = [];
  private apiUrl = 'http://localhost:8080/trips';

  private subject = new BehaviorSubject<Trip[]>(this.data);
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

  private refresh(): void {
    this.subject.next([...this.data]);
  }

  getAll(): Observable<Trip[]> {
    return this.data$;
  }

  getLatestTrips(page: Number=1): Observable<Trip[]> {
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
