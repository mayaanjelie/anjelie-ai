import type { ProductPassport } from "../supabase.server";

export type ComplianceLevel = "red" | "yellow" | "green";

export function calcComplianceScore(passport: Partial<ProductPassport>): number {
  const checks = [
    Array.isArray(passport.fiber_composition) && passport.fiber_composition.length > 0,
    !!passport.country_of_manufacture,
    passport.carbon_footprint != null,
    !!passport.care_instructions,
    !!passport.recycling_instructions,
    passport.repairability_score != null,
    Array.isArray(passport.certifications) && passport.certifications.length > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function getComplianceLevel(score: number): ComplianceLevel {
  if (score >= 80) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

export function getComplianceBadge(score: number): {
  label: string;
  tone: "success" | "warning" | "critical";
} {
  const level = getComplianceLevel(score);
  if (level === "green") return { label: `${score}% Complete`, tone: "success" };
  if (level === "yellow") return { label: `${score}% Complete`, tone: "warning" };
  return { label: `${score}% Complete`, tone: "critical" };
}

export const CERTIFICATIONS = [
  "GOTS",
  "Fair Trade",
  "OEKO-TEX Standard 100",
  "Bluesign",
  "B Corp",
  "Cradle to Cradle",
  "EU Ecolabel",
  "Rainforest Alliance",
] as const;

export const COUNTRIES = [
  { value: "BD", label: "Bangladesh" },
  { value: "CN", label: "China" },
  { value: "ET", label: "Ethiopia" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "IN", label: "India" },
  { value: "IT", label: "Italy" },
  { value: "MX", label: "Mexico" },
  { value: "MA", label: "Morocco" },
  { value: "PT", label: "Portugal" },
  { value: "ES", label: "Spain" },
  { value: "TR", label: "Turkey" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "VN", label: "Vietnam" },
];

export const COUNTRY_FLAGS: Record<string, string> = {
  BD: "🇧🇩", CN: "🇨🇳", ET: "🇪🇹", FR: "🇫🇷", DE: "🇩🇪",
  IN: "🇮🇳", IT: "🇮🇹", MX: "🇲🇽", MA: "🇲🇦", PT: "🇵🇹",
  ES: "🇪🇸", TR: "🇹🇷", GB: "🇬🇧", US: "🇺🇸", VN: "🇻🇳",
};
