import { useMemo, useCallback } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/components/ThemeProvider";

const CURVE_COLORS: Record<string, string> = {
  base: "#001f87",
  curve1: "#7fba50",
  curve2: "#e86b00",
};

const CURVE_LABELS: Record<string, string> = {
  base: "Base (IBRD)",
  curve1: "Curve 1 (ONT)",
  curve2: "Curve 2 (PSPCAP)",
};

// Dual-encoding: unique marker shapes per curve
const CURVE_SYMBOLS: Record<string, string> = {
  base: "circle",
  curve1: "square",
  curve2: "diamond",
};

export function CrossSectionPlot() {
  const bonds = useAppStore((s) => s.bonds);
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const setSelectedBondId = useAppStore((s) => s.setSelectedBondId);
  const highContrast = useAppStore((s) => s.highContrast);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const latestDate = useMemo(() => {
    if (spreads.length === 0) return null;
    return spreads.reduce((max, s) => (s.curveDate > max ? s.curveDate : max), spreads[0].curveDate);
  }, [spreads]);

  const { traces, ariaLabel } = useMemo(() => {
    if (!latestDate) return { traces: [], ariaLabel: "Cross-section scatter chart. No data loaded." };

    const latest = spreads.filter((s) => s.curveDate === latestDate);
    const bondMap = new Map(bonds.map((b) => [b.id, b]));
    const byCurve: Record<string, typeof latest> = {};
    for (const s of latest) {
      const bond = bondMap.get(s.bondId);
      if (!bond) continue;
      if (!byCurve[bond.curve]) byCurve[bond.curve] = [];
      byCurve[bond.curve].push(s);
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
          color: points.map((p) => (p.bondId === selectedBondId ? "#e6ff00" : isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)")),
          width: points.map((p) => (p.bondId === selectedBondId ? 3 : 1)),
        },
      },
      hovertemplate: "%{text}<extra></extra>",
    }));

    // Interpolation fit lines with distinct dash patterns
    const DASH_PATTERNS: Record<string, string> = { base: "dot", curve1: "dash", curve2: "dashdot" };
    const interpTraces = Object.entries(byCurve).map(([curve, points]) => {
      const sorted = [...points].sort((a, b) => a.yearsToMaturity - b.yearsToMaturity);
      const interpKey = curve === "base" ? "interpBase" : curve === "curve1" ? "interpCurve1" : "interpCurve2";
      return {
        x: sorted.map((p) => p.yearsToMaturity),
        y: sorted.map((p) => (p as any)[interpKey] ?? null),
        name: `${CURVE_LABELS[curve]} fit`,
        type: "scatter" as const,
        mode: (highContrast ? "lines+markers" : "lines") as any,
        line: { color: CURVE_COLORS[curve], width: highContrast ? 3 : 1.5, dash: DASH_PATTERNS[curve] as any },
        marker: highContrast ? { size: 6, symbol: CURVE_SYMBOLS[curve] } : undefined,
        showlegend: false,
        hoverinfo: "skip" as const,
      };
    });

    return {
      traces: [...scatterTraces, ...interpTraces],
      ariaLabel: `Cross-section scatter chart for ${latestDate}. ${latest.length} bonds across ${Object.keys(byCurve).length} curves. Spreads range from ${minSpread} to ${maxSpread} bps.`,
    };
  }, [spreads, bonds, latestDate, selectedBondId, isDark, highContrast]);

  const handleClick = useCallback(
    (event: any) => {
      const point = event.points?.[0];
      if (point?.customdata) setSelectedBondId(point.customdata as string);
    },
    [setSelectedBondId]
  );

  const bg = isDark ? "#001a33" : "#ffffff";
  const fg = isDark ? "#e6f1f3" : "#002140";
  const grid = isDark ? "#1a3a5c" : "#d9d9d9";

  if (bonds.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-muted-foreground" role="img" aria-label="Cross-section chart placeholder. No data loaded.">
        <p className="text-caption">Load data to view cross-section</p>
      </div>
    );
  }

  return (
    <div role="img" aria-label={ariaLabel} tabIndex={0}>
      <Plot
        data={traces as any}
        layout={{
          paper_bgcolor: highContrast ? (isDark ? "#000" : "#fff") : bg,
          plot_bgcolor: highContrast ? (isDark ? "#000" : "#fff") : bg,
          font: { family: "Inter", size: 12, color: highContrast ? (isDark ? "#fff" : "#000") : fg },
          margin: { t: 8, r: 16, b: 40, l: 50 },
          xaxis: { title: { text: "Years to Maturity", font: { size: 12 } }, gridcolor: grid, zerolinecolor: grid, color: fg },
          yaxis: { title: { text: "Spread (bps)", font: { size: 12 } }, gridcolor: grid, zerolinecolor: grid, color: fg },
          legend: { orientation: "h", y: -0.18, x: 0.5, xanchor: "center", font: { size: 11 } },
          hovermode: "closest",
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: 320 }}
        onClick={handleClick}
      />
    </div>
  );
}
