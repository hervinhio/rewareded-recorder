export interface SpecialMonth {
  id?: string;
  reason: string;
  year: number;
  month: number;
  congregationId?: string; // Multi-tenancy: congregation this special month belongs to
}