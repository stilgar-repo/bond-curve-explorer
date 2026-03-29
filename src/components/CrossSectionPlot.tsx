import { ScatterChart } from "lucide-react";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";

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
          size: pts.map((p) => (p.bondId === selectedBondId ? 14 : 9)),
          line: {
            width: pts.map((p) => (p.bondId === selectedBondId ? 2 : 0)),
            color: "#000",
          },
        },
        hovertemplate: "%{text}<br>YTM: %{x:.1f}y<br>Spread: %{y:.0f}bps<extra></extra>",
      };
    });
  }, [latestSpreads, bonds, selectedBondId]);

  if (bonds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] opacity-50">
        <ScatterChart className="h-12 w-12" strokeWidth={1.2} />
        <p className="text-sm mt-3">Load data to view cross-section</p>
      </div>
    );
  }

  return (
    <Plot
      data={traces}
      layout={{
        title: { text: `Cross-Section (${latestDate ?? ""})` },
        xaxis: { title: { text: "Years to Maturity" } },
        yaxis: { title: { text: "Spread (bps)" } },
        margin: { t: 40, r: 20, b: 50, l: 60 },
        hovermode: "closest",
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "inherit" },
        legend: { orientation: "h", y: -0.2 },
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 350 }}
      onClick={(e) => {
        const pt = e.points[0];
        if (pt?.customdata) {
          setSelectedBondId(pt.customdata as string);
        }
      }}
    />
  );
}
