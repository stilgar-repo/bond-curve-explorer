import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/components/ThemeProvider";
import { buildInterpTraces } from "@/lib/transforms";
import { getPlotlyColors, basePlotlyLayout } from "@/lib/plotly-theme";

export function HistoricalChart1() {
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const highContrast = useAppStore((s) => s.highContrast);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { traces, ariaLabel } = useMemo(
    () => buildInterpTraces(spreads, selectedBondId, highContrast),
    [spreads, selectedBondId, highContrast]
  );

  const colors = getPlotlyColors(isDark, highContrast);

  if (!selectedBondId || traces.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground" role="img" aria-label="Interpolated spreads chart placeholder. Select a bond to view.">
        <p className="text-caption">Select a bond to view interpolated spreads</p>
      </div>
    );
  }

  return (
    <div role="img" aria-label={ariaLabel} tabIndex={0}>
      <Plot
        data={traces}
        layout={basePlotlyLayout(colors, {
          xaxis: { title: { text: "Date", font: { size: 12 } }, gridcolor: colors.grid, color: colors.fg },
          yaxis: { title: { text: "Spread (bps)", font: { size: 12 } }, gridcolor: colors.grid, color: colors.fg },
          legend: { orientation: "h", y: -0.2, x: 0.5, xanchor: "center", font: { size: 11 } },
          hovermode: "x unified",
        })}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: 280 }}
      />
    </div>
  );
}
