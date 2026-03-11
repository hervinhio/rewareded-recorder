export interface SpecialMonth {
  id?: string;
  reason: string;
  year: number;
  month: number;
  congregationId?: number; // Multi-tenancy: congregation this special month belongs to (stores congregation.congregationNumber)
}