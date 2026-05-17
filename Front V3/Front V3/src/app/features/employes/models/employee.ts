export interface Employee {
  /** Primary key; maps to `id_employee SERIAL PRIMARY KEY` in Supabase. */
  id_employee: number;
  /** Full name of the employee. */
  name: string;
  /** Monthly salary in the configured currency unit. */
  salary: number;
  /** Job title for display; not stored in the database — derived from `role` when needed. */
  position?: string;
  /** Denormalized trip counter for dashboard widgets; not persisted in the database. */
  tripsCompleted?: number;
}
