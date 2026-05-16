import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Employee } from '../models/employee';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private data: Employee[] = [];
  private apiUrl = 'http://localhost:8080/employees';

  private dataSubject = new BehaviorSubject<Employee[]>(this.data);
  data$: Observable<Employee[]> = this.dataSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  getAll(): Observable<Employee[]> {
    return this.data$;
  }

  getLatestEmployees(): Observable<Employee[]> {
    if (this.data.length > 0) return of(this.data);
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => {
        const list = response._embedded?.employees || [];
        this.data = list;
        this.refresh();
        return [...list];
      })
    );
  }

  private invalidate(): void {
    this.data = [];
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  register(employeeData: Employee): Observable<any> {
    const { id_employee, ...payload } = employeeData;
    return this.http.post<any>('http://localhost:8080/register', payload, { headers: this.getHeaders() }).pipe(
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
