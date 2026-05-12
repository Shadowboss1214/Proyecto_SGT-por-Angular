export interface Trip {
  id_trip: number;
  id_transport: number; // FK a transport
  id_employee: number;  // FK a employees
  id_route: number;     // FK a route
  income: number;
  fuelcost: number;
  date: string;         // Las fechas de SQL llegan como string (ISO 8601)
}

export interface Route {
  id_route: number;
  origin: string;
  destine: string;
  distance: number;
}