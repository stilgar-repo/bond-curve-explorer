import { ScatterChart } from "lucide-react";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { usePlotlyTheme } from "@/hooks/usePlotlyTheme";

const CURVE_COLORS: Record<string, string> = {
  base: "#001f87",
  curve1: "#7fba50",
  curve2: "#e86b00",
};

export function CrossSectionPlot() {
  const bonds = useAppStore((s) => s.bonds);
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const setSelectedBondId = useAppStore((s) => s.setSelectedBondId);
  const plotTheme = usePlotlyTheme();

  const latestDate = useMemo(() => {
    if (spreads.length === 0) return null;
    return spreads.reduce((max, s) => (s.curveDate > max ? s.curveDate : max), spreads[0].curveDate);
  }, [spreads]);

  const latestSpreads = useMemo(() => {
    if (!latestDate) return [];
    return spreads.filter((s) => s.curveDate === latestDate);
  }, [spreads, latestDate]);

  const traces = useMemo(() => {
    const curveGroups: Record<string, typeof latestSpreads> = {};
    for (const s of latestSpreads) {
      const bond = bonds.find((b) => b.id === s.bondId);
      const curve = bond?.curve ?? "base";
      if (!curveGroups[curve]) curveGroups[curve] = [];
      curveGroups[curve].push(s);
    }

    return Object.entries(curveGroups).map(([curve, pts]) => {
      const bondData = pts.map((p) => bonds.find((b) => b.id === p.bondId));
      return {
        x: pts.map((p) => p.yearsToMaturity),
        y: pts.map((p) => p.spread),
        text: bondData.map(
          (b) =>
            `${b?.ticker ?? "?"}<br>Cpn: ${b?.coupon ?? "?"}<br>Mat: ${b?.maturity ?? "?"}<br>Amt: ${b?.amountIssued?.toLocaleString() ?? "?"}`
        ),
        customdata: pts.map((p) => p.bondId),
        type: "scatter" as const,
        mode: "markers" as const,
        name: curve === "base" ? "Base Curve" : curve === "curve1" ? "Curve 1" : "Curve 2",
        marker: {
          color: CURVE_COLORS[curve] ?? "#888",
          size: pts.map((p) => (p.bondId === selectedBondId ? 14 : 8)),
          line: {
            width: pts.map((p) => (p.bondId === selectedBondId ? 2 : 0.5)),
            color: pts.map((p) => (p.bondId === selectedBondId ? "#e6ff00" : "rgba(255,255,255,0.5)")),
          },
        },
        hovertemplate: "%{text}<br>YTM: %{x:.1f}y<br>Spread: %{y:.0f}bps<extra></extra>",
      };
    });
  }, [latestSpreads, bonds, selectedBondId]);

  if (bonds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] text-muted-foreground">
        <ScatterChart className="h-10 w-10" strokeWidth={1} />
        <p className="text-xs mt-2">Load data to view cross-section</p>
      </div>
    );
  }

  return (
    <Plot
      data={traces}
      layout={{
        ...plotTheme,
        title: { text: `Cross-Section (${latestDate ?? ""})`, font: { size: 12, ...plotTheme.font } },
        xaxis: { ...plotTheme.xaxis, title: { text: "Years to Maturity", font: { size: 10 } } },
        yaxis: { ...plotTheme.yaxis, title: { text: "Spread (bps)", font: { size: 10 } } },
        hovermode: "closest",
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 320 }}
      onClick={(e) => {
        const pt = e.points[0];
        if (pt?.customdata) {
          setSelectedBondId(pt.customdata as string);
        }
      }}
    />
  );
}
