import { useMemo, useCallback } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/components/ThemeProvider";
import { buildCrossSectionTraces } from "@/lib/transforms";
import { getPlotlyColors, basePlotlyLayout } from "@/lib/plotly-theme";

export function CrossSectionPlot() {
  const bonds = useAppStore((s) => s.bonds);
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const setSelectedBondId = useAppStore((s) => s.setSelectedBondId);
  const highContrast = useAppStore((s) => s.highContrast);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { traces, ariaLabel } = useMemo(
    () => buildCrossSectionTraces({ bonds, spreads, selectedBondId, isDark, highContrast }),
    [spreads, bonds, selectedBondId, isDark, highContrast]
  );

  const handleClick = useCallback(
    (event: any) => {
      const point = event.points?.[0];
      if (point?.customdata) setSelectedBondId(point.customdata as string);
    },
    [setSelectedBondId]
  );

  const colors = getPlotlyColors(isDark, highContrast);

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
        layout={basePlotlyLayout(colors, {
          xaxis: { title: { text: "Years to Maturity", font: { size: 12 } }, gridcolor: colors.grid, zerolinecolor: colors.grid, color: colors.fg },
          yaxis: { title: { text: "Spread (bps)", font: { size: 12 } }, gridcolor: colors.grid, zerolinecolor: colors.grid, color: colors.fg },
          legend: { orientation: "h", y: -0.18, x: 0.5, xanchor: "center", font: { size: 11 } },
          hovermode: "closest",
        })}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: 320 }}
        onClick={handleClick}
      />
    </div>
  );
}
