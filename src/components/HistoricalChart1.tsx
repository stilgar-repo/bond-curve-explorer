import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/components/ThemeProvider";

const INTERP_KEYS = [
  { key: "interpBase", label: "Base Curve", color: "#001f87" },
  { key: "interpCurve1", label: "Curve 1", color: "#7fba50" },
  { key: "interpCurve2", label: "Curve 2", color: "#e86b00" },
] as const;

export function HistoricalChart1() {
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
    return INTERP_KEYS.map(({ key, label, color }) => ({
      x: sorted.map((s) => s.curveDate),
      y: sorted.map((s) => (s as any)[key] ?? null),
      name: label,
      type: "scatter" as const,
      mode: "lines" as const,
      line: { color, width: 1.5 },
    }));
  }, [filtered]);

  const bg = isDark ? "#001a33" : "#ffffff";
  const fg = isDark ? "#e6f1f3" : "#002140";
  const grid = isDark ? "#1a3a5c" : "#d9d9d9";

  if (!selectedBondId || filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground">
        <p className="text-caption">Select a bond to view interpolated spreads</p>
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
        xaxis: { title: { text: "Date", font: { size: 12 } }, gridcolor: grid, color: fg },
        yaxis: { title: { text: "Spread (bps)", font: { size: 12 } }, gridcolor: grid, color: fg },
        legend: { orientation: "h", y: -0.2, x: 0.5, xanchor: "center", font: { size: 11 } },
        hovermode: "x unified",
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: 280 }}
    />
  );
}
