/** Centralized curve visual configuration — single source of truth */

export type CurveKey = "base" | "curve1" | "curve2";

export interface CurveVisual {
  key: CurveKey;
  label: string;
  color: string;
  dash: "solid" | "dash" | "dot" | "dashdot";
  symbol: "circle" | "square" | "diamond" | "triangle-up";
  interpField: "interpBase" | "interpCurve1" | "interpCurve2";
}

export const CURVE_VISUALS: readonly CurveVisual[] = [
  { key: "base", label: "Base (IBRD)", color: "#001f87", dash: "solid", symbol: "circle", interpField: "interpBase" },
  { key: "curve1", label: "Curve 1 (ONT)", color: "#7fba50", dash: "dash", symbol: "square", interpField: "interpCurve1" },
  { key: "curve2", label: "Curve 2 (PSPCAP)", color: "#e86b00", dash: "dashdot", symbol: "diamond", interpField: "interpCurve2" },
] as const;

/** Lookup helpers */
export const CURVE_COLORS: Record<string, string> = Object.fromEntries(
  CURVE_VISUALS.map((c) => [c.key, c.color])
);

export const CURVE_LABELS: Record<string, string> = Object.fromEntries(
  CURVE_VISUALS.map((c) => [c.key, c.label])
);

export const CURVE_SYMBOLS: Record<string, string> = Object.fromEntries(
  CURVE_VISUALS.map((c) => [c.key, c.symbol])
);

export const CURVE_DASHES: Record<string, string> = Object.fromEntries(
  CURVE_VISUALS.map((c) => [c.key, c.dash])
);
