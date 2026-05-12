import { Injectable } from '@angular/core';
import { Employee } from '../models/employee';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  // Array vacío listo para ser llenado desde la DB
  private data: Employee[] = [];

  private dataSubject = new BehaviorSubject<Employee[]>(this.data);
  data$: Observable<Employee[]> = this.dataSubject.asObservable();

  getAll(): Observable<Employee[]> {
    return this.data$;
  }

  // Ahora recibe un number y busca por id_employee
  getById(id: number): Employee | undefined {
    return this.data.find(e => e.id_employee === id);
  }

  create(employeeData: Employee): void {
    const newItem: Employee = {
      ...employeeData,
      // Generamos un ID numérico temporal (simulando el SERIAL de Postgres)
      id_employee: Math.floor(Date.now() / 1000)
    };

    this.data.push(newItem);
    this.refresh();
  }

  // Ahora recibe un number y busca por id_employee
  update(id: number, employeeData: Employee): void {
    const index = this.data.findIndex(e => e.id_employee === id);

    if (index !== -1) {
      // Mantenemos el id_employee original y actualizamos los datos
      this.data[index] = { ...employeeData, id_employee: id };
      this.refresh();
    }
  }

  // Ahora recibe un number y filtra por id_employee
  delete(id: number): void {
    this.data = this.data.filter(e => e.id_employee !== id);
    this.refresh();
  }

  private refresh(): void {
    this.dataSubject.next([...this.data]);
  }
}