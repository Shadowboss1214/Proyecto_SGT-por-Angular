export interface Transport {
  /** Primary key; maps to `id_transport SERIAL PRIMARY KEY`. */
  id_transport: number;
  /** Human-readable vehicle identifier. */
  name: string;
  /** Vehicle category (e.g., "bus", "van"). */
  type: string;
  /** License plate; must be unique per vehicle. */
  plate: string;
  /** Operational state (e.g., "active", "maintenance"). */
  status: string;
  /** Operating cost per kilometer; stored as lowercase `costperkm` in Postgres. */
  costperkm: number;
  /** Periodic maintenance expense per cycle. */
  maintenancecost: number;
  /** Fuel consumed per kilometer. */
  fuelconsumption: number;
}
