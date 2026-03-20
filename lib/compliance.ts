import { ProductPassport } from './supabase';

// Calculate compliance score (0-100) based on filled fields
export function calculateComplianceScore(data: Partial<ProductPassport>): number {
  const fields = [
    { key: 'fiber_composition', weight: 20, check: (v: unknown) => Array.isArray(v) && (v as unknown[]).length > 0 },
    { key: 'country_of_manufacture', weight: 15, check: (v: unknown) => !!v },
    { key: 'carbon_footprint', weight: 15, check: (v: unknown) => v !== null && v !== undefined },
    { key: 'care_instructions', weight: 15, check: (v: unknown) => !!v },
    { key: 'recycling_instructions', weight: 15, check: (v: unknown) => !!v },
    { key: 'repairability_score', weight: 10, check: (v: unknown) => v !== null && v !== undefined },
    { key: 'certifications', weight: 5, check: (v: unknown) => Array.isArray(v) && (v as unknown[]).length > 0 },
    { key: 'supplier_name', weight: 3, check: (v: unknown) => !!v },
    { key: 'supplier_country', weight: 2, check: (v: unknown) => !!v },
  ];

  let score = 0;
  for (const field of fields) {
    const value = (data as Record<string, unknown>)[field.key];
    if (field.check(value)) {
      score += field.weight;
    }
  }
  return score;
}

export type ComplianceLevel = 'red' | 'yellow' | 'green';

export function getComplianceLevel(score: number): ComplianceLevel {
  if (score >= 75) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

export function getComplianceLabel(score: number): string {
  const level = getComplianceLevel(score);
  if (level === 'green') return 'DPP Compliant';
  if (level === 'yellow') return 'Partial Compliance';
  return 'Incomplete';
}

export const COMPLIANCE_COLORS = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};
