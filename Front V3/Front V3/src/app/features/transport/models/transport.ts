export interface Transport {
  id_transport: number;
  name: string;
  type: string;
  plate: string;
  status: string;
  costperkm: number;       // Ojo: Postgres suele convertir a minúsculas si no usas comillas
  maintenancecost: number;
  fuelconsumption: number;
}