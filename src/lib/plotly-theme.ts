/** Shared Plotly layout helpers — eliminates duplicated theme logic across charts */

interface PlotlyColors {
  bg: string;
  fg: string;
  grid: string;
}

export function getPlotlyColors(isDark: boolean, highContrast: boolean): PlotlyColors {
  if (highContrast) {
    return {
      bg: isDark ? "#000" : "#fff",
      fg: isDark ? "#fff" : "#000",
      grid: isDark ? "#333" : "#ccc",
    };
  }
  return {
    bg: isDark ? "#001a33" : "#ffffff",
    fg: isDark ? "#e6f1f3" : "#002140",
    grid: isDark ? "#1a3a5c" : "#d9d9d9",
  };
}

export function basePlotlyLayout(
  colors: PlotlyColors,
  overrides?: Partial<Plotly.Layout>
): Partial<Plotly.Layout> {
  return {
    paper_bgcolor: colors.bg,
    plot_bgcolor: colors.bg,
    font: { family: "Inter", size: 12, color: colors.fg },
    margin: { t: 8, r: 16, b: 40, l: 50 },
    hovermode: "closest",
    ...overrides,
  };
}
