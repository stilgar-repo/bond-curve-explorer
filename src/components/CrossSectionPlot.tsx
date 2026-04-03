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

export function CrossSectionPlot() {
  const bonds = useAppStore((s) => s.bonds);
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const setSelectedBondId = useAppStore((s) => s.setSelectedBondId);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const latestDate = useMemo(() => {
    if (spreads.length === 0) return null;
    return spreads.reduce((max, s) => (s.curveDate > max ? s.curveDate : max), spreads[0].curveDate);
  }, [spreads]);

  const traces = useMemo(() => {
    if (!latestDate) return [];
    const latest = spreads.filter((s) => s.curveDate === latestDate);
    const bondMap = new Map(bonds.map((b) => [b.id, b]));

    const byCurve: Record<string, typeof latest> = {};
    for (const s of latest) {
      const bond = bondMap.get(s.bondId);
      if (!bond) continue;
      if (!byCurve[bond.curve]) byCurve[bond.curve] = [];
      byCurve[bond.curve].push(s);
    }

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
        color: CURVE_COLORS[curve] || "#999",
        size: points.map((p) => {
          const b = bondMap.get(p.bondId);
          return b ? Math.max(8, Math.sqrt(b.amountIssued / 1e8) * 4) : 8;
        }),
        opacity: points.map((p) => (selectedBondId && p.bondId !== selectedBondId ? 0.3 : 0.85)),
        line: {
          color: points.map((p) => (p.bondId === selectedBondId ? "#e6ff00" : "rgba(255,255,255,0.6)")),
          width: points.map((p) => (p.bondId === selectedBondId ? 3 : 1)),
        },
      },
      hovertemplate: "%{text}<extra></extra>",
    }));

    const interpTraces = Object.entries(byCurve).map(([curve, points]) => {
      const sorted = [...points].sort((a, b) => a.yearsToMaturity - b.yearsToMaturity);
      const interpKey = curve === "base" ? "interpBase" : curve === "curve1" ? "interpCurve1" : "interpCurve2";
      return {
        x: sorted.map((p) => p.yearsToMaturity),
        y: sorted.map((p) => (p as any)[interpKey] ?? null),
        name: `${CURVE_LABELS[curve]} fit`,
        type: "scatter" as const,
        mode: "lines" as const,
        line: { color: CURVE_COLORS[curve], width: 1.5, dash: "dot" as const },
        showlegend: false,
        hoverinfo: "skip" as const,
      };
    });

    return [...scatterTraces, ...interpTraces];
  }, [spreads, bonds, latestDate, selectedBondId]);

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
      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
        <p className="text-caption">Load data to view cross-section</p>
      </div>
    );
  }

  return (
    <Plot
      data={traces as any}
      layout={{
        paper_bgcolor: bg,
        plot_bgcolor: bg,
        font: { family: "Inter", size: 12, color: fg },
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
  );
}
