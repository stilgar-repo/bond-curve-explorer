import { useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";

/** Shared Plotly layout config that respects light/dark mode */
export function usePlotlyTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return useMemo(
    () => ({
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: {
        family: "Inter, system-ui, sans-serif",
        size: 11,
        color: isDark ? "#dbeaed" : "#002140",
      },
      xaxis: {
        gridcolor: isDark ? "rgba(0,31,135,0.3)" : "rgba(181,209,212,0.4)",
        zerolinecolor: isDark ? "rgba(0,31,135,0.5)" : "rgba(181,209,212,0.6)",
      },
      yaxis: {
        gridcolor: isDark ? "rgba(0,31,135,0.3)" : "rgba(181,209,212,0.4)",
        zerolinecolor: isDark ? "rgba(0,31,135,0.5)" : "rgba(181,209,212,0.6)",
      },
      margin: { t: 30, r: 16, b: 40, l: 50 },
      legend: {
        orientation: "h" as const,
        y: -0.22,
        font: { size: 10, color: isDark ? "#b5d1d4" : "#002140" },
      },
    }),
    [isDark]
  );
}
