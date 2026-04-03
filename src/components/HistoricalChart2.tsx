import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/components/ThemeProvider";

export function HistoricalChart2() {
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const highContrast = useAppStore((s) => s.highContrast);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const filtered = useMemo(
    () => (selectedBondId ? spreads.filter((s) => s.bondId === selectedBondId) : []),
    [spreads, selectedBondId]
  );

  const { traces, ariaLabel } = useMemo(() => {
    if (filtered.length === 0) return { traces: [], ariaLabel: "Spread difference chart placeholder. No bond selected." };
    const sorted = [...filtered].sort((a, b) => a.curveDate.localeCompare(b.curveDate));
    const diffs = sorted.map((s) =>
      s.interpCurve1 != null && s.interpCurve2 != null ? s.interpCurve1 - s.interpCurve2 : null
    ).filter((v): v is number => v !== null);
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
          mode: (highContrast ? "lines+markers" : "lines") as any,
          fill: "tozeroy" as const,
          line: { color: "#61e3e8", width: highContrast ? 3 : 1.5, dash: "solid" as const },
          marker: highContrast ? { size: 5, symbol: "triangle-up" } : undefined,
          fillcolor: isDark ? "rgba(97,227,232,0.12)" : "rgba(97,227,232,0.15)",
        },
      ],
      ariaLabel: `Area chart showing spread difference (Curve 1 minus Curve 2) from ${dateRange}. Range: ${minDiff} to ${maxDiff} bps.`,
    };
  }, [filtered, isDark, highContrast]);

  const bg = isDark ? "#001a33" : "#ffffff";
  const fg = isDark ? "#e6f1f3" : "#002140";
  const grid = isDark ? "#1a3a5c" : "#d9d9d9";

  if (!selectedBondId || filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground" role="img" aria-label="Spread difference chart placeholder. Select a bond to view.">
        <p className="text-caption">Select a bond to view spread difference</p>
      </div>
    );
  }

  return (
    <div role="img" aria-label={ariaLabel} tabIndex={0}>
      <Plot
        data={traces}
        layout={{
          paper_bgcolor: highContrast ? (isDark ? "#000" : "#fff") : bg,
          plot_bgcolor: highContrast ? (isDark ? "#000" : "#fff") : bg,
          font: { family: "Inter", size: 12, color: highContrast ? (isDark ? "#fff" : "#000") : fg },
          margin: { t: 8, r: 16, b: 40, l: 50 },
          xaxis: { title: { text: "Date", font: { size: 12 } }, gridcolor: grid, color: fg },
          yaxis: { title: { text: "Δ Spread (bps)", font: { size: 12 } }, gridcolor: grid, color: fg },
          hovermode: "x unified",
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: 280 }}
      />
    </div>
  );
}
