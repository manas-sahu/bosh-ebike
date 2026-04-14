// Map Bosch internal assist mode codes to human-readable names.
// Codes follow the pattern A100[MODE_ID]. Known mappings are based on
// the Bosch Smart System mode identifiers and typical range ordering:
//   highest range → lowest assist → Eco
//   lowest range  → highest assist → Turbo

const MODE_MAP: Record<string, { label: string; color: string }> = {
  "0":          { label: "Off",   color: "text-muted-foreground" },
  "A100GAAAD0": { label: "Eco",   color: "text-emerald-400" },
  "A100G0AUTO": { label: "Auto",  color: "text-blue-400" },
  "A100MSPIC8": { label: "Sport", color: "text-amber-400" },
  "A100GAAAA0": { label: "Turbo", color: "text-red-400" },
};

export function getAssistModeLabel(code: string): string {
  return MODE_MAP[code]?.label ?? code;
}

export function getAssistModeColor(code: string): string {
  return MODE_MAP[code]?.color ?? "text-foreground";
}
