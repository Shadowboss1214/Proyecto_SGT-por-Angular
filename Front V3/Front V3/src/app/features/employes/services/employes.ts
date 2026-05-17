import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Employee } from '../models/employee';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private data: Employee[] = [];
  private apiUrl = `${environment.apiUrl}/employees`;
  private registerUrl = `${environment.apiUrl}/register`;
  private _currentPage = 1;
  private _totalPages = 1;

  get page() { return this._currentPage; }
  get total() { return this._totalPages; }

  private dataSubject = new BehaviorSubject<Employee[]>(this.data);
  data$: Observable<Employee[]> = this.dataSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }

  private invalidate(): void {
    this.data = [];
  }

  get snapshot(): Employee[] {
    return [...this.data];
  }

  getAll(): Observable<Employee[]> {
    return this.data$;
  }

  getLatestEmployees(page: number = 1): Observable<Employee[]> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        const list = response._embedded?.employees || [];
        this.data = list;
        this._currentPage = response.page || page;
        this._totalPages = response.page_count || 1;
        this.refresh();
        return [...list];
      })
    );
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  register(employeeData: Employee): Observable<any> {
    const { id_employee, ...payload } = employeeData;
    return this.http.post<any>(this.registerUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestEmployees().subscribe(); })
    );
  }

  create(employeeData: Employee): Observable<any> {
    const { id_employee, ...payload } = employeeData;
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestEmployees().subscribe(); })
    );
  }

  update(id: number, employeeData: Employee): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employeeData, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestEmployees().subscribe(); })
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => { this.invalidate(); this.getLatestEmployees().subscribe(); })
    );
  }
}