export interface Employee {
  id_employee: number; // Coincide con SERIAL PRIMARY KEY
  name: string;
  salary: number;
  // Si estos no están en la DB pero los necesitas en el Front, úsalos como opcionales:
  position?: string;
  tripsCompleted?: number;
}