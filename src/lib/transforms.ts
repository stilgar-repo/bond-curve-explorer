/** Pure data transform functions — no React, no side effects */

import type { Bond, HistoricalSpread } from "@/types/bond";
import { CURVE_VISUALS, CURVE_COLORS, CURVE_LABELS, CURVE_SYMBOLS, CURVE_DASHES } from "@/config/curves";

// ─── Cross-Section ──────────────────────────────────────────

export interface CrossSectionInput {
  bonds: Bond[];
  spreads: HistoricalSpread[];
  selectedBondId: string | null;
  isDark: boolean;
  highContrast: boolean;
}

export function getLatestDate(spreads: HistoricalSpread[]): string | null {
  if (spreads.length === 0) return null;
  return spreads.reduce((max, s) => (s.curveDate > max ? s.curveDate : max), spreads[0].curveDate);
}

export function buildCrossSectionTraces(input: CrossSectionInput) {
  const { bonds, spreads, selectedBondId, isDark, highContrast } = input;
  const latestDate = getLatestDate(spreads);
  if (!latestDate) return { traces: [], ariaLabel: "Cross-section scatter chart. No data loaded." };

  const latest = spreads.filter((s) => s.curveDate === latestDate);
  const bondMap = new Map(bonds.map((b) => [b.id, b]));
  const byCurve: Record<string, HistoricalSpread[]> = {};
  for (const s of latest) {
    const bond = bondMap.get(s.bondId);
    if (!bond) continue;
    (byCurve[bond.curve] ??= []).push(s);
  }

  const allSpreads = latest.map((s) => s.spread);
  const minSpread = Math.min(...allSpreads).toFixed(0);
  const maxSpread = Math.max(...allSpreads).toFixed(0);

  const scatterTraces = Object.entries(byCurve).map(([curve, points]) => ({
    x: points.map((p) => p.yearsToMaturity),
    y: points.map((p) => p.spread),
    text: points.map((p) => {
      const b = bondMap.get(p.bondId);
      return `${b?.ticker} ${b?.maturity?.slice(0, 4)}<br>${p.spread.toFixed(0)} bps`;
    }),
    customdata: points.map((p) => p.bondId),
    name: CURVE_LABELS[curve] || curve,
    type: "scatter" as const,
    mode: "markers" as const,
    marker: {
      symbol: CURVE_SYMBOLS[curve] || "circle",
      color: CURVE_COLORS[curve] || "#999",
      size: points.map((p) => {
        const b = bondMap.get(p.bondId);
        return b ? Math.max(10, Math.sqrt(b.amountIssued / 1e8) * 4) : 10;
      }),
      opacity: points.map((p) => (selectedBondId && p.bondId !== selectedBondId ? 0.3 : 0.85)),
      line: {
        color: points.map((p) =>
          p.bondId === selectedBondId
            ? "#e6ff00"
            : isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)"
        ),
        width: points.map((p) => (p.bondId === selectedBondId ? 3 : 1)),
      },
    },
    hovertemplate: "%{text}<extra></extra>",
  }));

  const interpTraces = Object.entries(byCurve).map(([curve, points]) => {
    const sorted = [...points].sort((a, b) => a.yearsToMaturity - b.yearsToMaturity);
    const visual = CURVE_VISUALS.find((v) => v.key === curve);
    const interpKey = visual?.interpField ?? "interpBase";
    return {
      x: sorted.map((p) => p.yearsToMaturity),
      y: sorted.map((p) => (p as any)[interpKey] ?? null),
      name: `${CURVE_LABELS[curve]} fit`,
      type: "scatter" as const,
      mode: (highContrast ? "lines+markers" : "lines") as Plotly.ScatterData["mode"],
      line: { color: CURVE_COLORS[curve], width: highContrast ? 3 : 1.5, dash: CURVE_DASHES[curve] as Plotly.Dash },
      marker: highContrast ? { size: 6, symbol: CURVE_SYMBOLS[curve] } : undefined,
      showlegend: false,
      hoverinfo: "skip" as const,
    };
  });

  return {
    traces: [...scatterTraces, ...interpTraces],
    ariaLabel: `Cross-section scatter chart for ${latestDate}. ${latest.length} bonds across ${Object.keys(byCurve).length} curves. Spreads range from ${minSpread} to ${maxSpread} bps.`,
  };
}

// ─── Historical Chart 1 (Interpolated Spreads) ─────────────

export function buildInterpTraces(
  spreads: HistoricalSpread[],
  selectedBondId: string | null,
  highContrast: boolean
) {
  const filtered = selectedBondId ? spreads.filter((s) => s.bondId === selectedBondId) : [];
  if (filtered.length === 0) {
    return { traces: [], ariaLabel: "Interpolated spreads timeseries. No bond selected." };
  }

  const sorted = [...filtered].sort((a, b) => a.curveDate.localeCompare(b.curveDate));
  const dateRange = `${sorted[0].curveDate} to ${sorted[sorted.length - 1].curveDate}`;

  const traces = CURVE_VISUALS.map(({ label, color, dash, symbol, interpField }) => ({
    x: sorted.map((s) => s.curveDate),
    y: sorted.map((s) => (s as any)[interpField] ?? null),
    name: label,
    type: "scatter" as const,
    mode: (highContrast ? "lines+markers" : "lines") as Plotly.ScatterData["mode"],
    line: { color, width: highContrast ? 3 : 1.5, dash: dash as Plotly.Dash },
    marker: highContrast ? { size: 6, symbol } : undefined,
  }));

  return {
    traces,
    ariaLabel: `Timeseries chart showing interpolated spreads from ${dateRange} for bond ${selectedBondId}. Three curves: Base, Curve 1, Curve 2.`,
  };
}

// ─── Historical Chart 2 (Spread Difference) ─────────────────

export function buildDiffTraces(
  spreads: HistoricalSpread[],
  selectedBondId: string | null,
  highContrast: boolean,
  isDark: boolean
) {
  const filtered = selectedBondId ? spreads.filter((s) => s.bondId === selectedBondId) : [];
  if (filtered.length === 0) {
    return { traces: [], ariaLabel: "Spread difference chart placeholder. No bond selected." };
  }

  const sorted = [...filtered].sort((a, b) => a.curveDate.localeCompare(b.curveDate));
  const diffs = sorted
    .map((s) => (s.interpCurve1 != null && s.interpCurve2 != null ? s.interpCurve1 - s.interpCurve2 : null))
    .filter((v): v is number => v !== null);
  const minDiff = Math.min(...diffs).toFixed(1);
  const maxDiff = Math.max(...diffs).toFixed(1);
  const dateRange = `${sorted[0].curveDate} to ${sorted[sorted.length - 1].curveDate}`;

  return {
    traces: [
      {
        x: sorted.map((s) => s.curveDate),
        y: sorted.map((s) =>
          s.interpCurve1 != null && s.interpCurve2 != null ? s.interpCurve1 - s.interpCurve2 : null
        ),
        name: "Curve 1 − Curve 2",
        type: "scatter" as const,
        mode: (highContrast ? "lines+markers" : "lines") as Plotly.ScatterData["mode"],
        fill: "tozeroy" as const,
        line: { color: "#61e3e8", width: highContrast ? 3 : 1.5, dash: "solid" as const },
        marker: highContrast ? { size: 5, symbol: "triangle-up" } : undefined,
        fillcolor: isDark ? "rgba(97,227,232,0.12)" : "rgba(97,227,232,0.15)",
      },
    ],
    ariaLabel: `Area chart showing spread difference (Curve 1 minus Curve 2) from ${dateRange}. Range: ${minDiff} to ${maxDiff} bps.`,
  };
}
