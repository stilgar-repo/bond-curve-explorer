import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/components/ThemeProvider";

export function HistoricalChart2() {
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const filtered = useMemo(
    () => (selectedBondId ? spreads.filter((s) => s.bondId === selectedBondId) : []),
    [spreads, selectedBondId]
  );

  const traces = useMemo(() => {
    if (filtered.length === 0) return [];
    const sorted = [...filtered].sort((a, b) => a.curveDate.localeCompare(b.curveDate));
    return [
      {
        x: sorted.map((s) => s.curveDate),
        y: sorted.map((s) =>
          s.interpCurve1 != null && s.interpCurve2 != null
            ? s.interpCurve1 - s.interpCurve2
            : null
        ),
        name: "Curve 1 − Curve 2",
        type: "scatter" as const,
        mode: "lines" as const,
        fill: "tozeroy" as const,
        line: { color: "#61e3e8", width: 1.5 },
        fillcolor: isDark ? "rgba(97,227,232,0.12)" : "rgba(97,227,232,0.15)",
      },
    ];
  }, [filtered, isDark]);

  const bg = isDark ? "#001a33" : "#ffffff";
  const fg = isDark ? "#e6f1f3" : "#002140";
  const grid = isDark ? "#1a3a5c" : "#d9d9d9";

  if (!selectedBondId || filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground">
        <p className="text-caption">Select a bond to view spread difference</p>
      </div>
    );
  }

  return (
    <Plot
      data={traces}
      layout={{
        paper_bgcolor: bg,
        plot_bgcolor: bg,
        font: { family: "Inter", size: 12, color: fg },
        margin: { t: 8, r: 16, b: 40, l: 50 },
        xaxis: {
          title: { text: "Date", font: { size: 12 } },
          gridcolor: grid,
          color: fg,
        },
        yaxis: {
          title: { text: "Δ Spread (bps)", font: { size: 12 } },
          gridcolor: grid,
          color: fg,
        },
        hovermode: "x unified",
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 280 }}
    />
  );
}
