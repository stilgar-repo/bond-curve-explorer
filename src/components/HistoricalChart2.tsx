import { Box, Select, Text } from "@mantine/core";
import { IconChartAreaLine } from "@tabler/icons-react";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";

/** Historical chart: Curve1 − Curve2 interpolated spread difference */
export function HistoricalChart2() {
  const bonds = useAppStore((s) => s.bonds);
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const setSelectedBondId = useAppStore((s) => s.setSelectedBondId);

  const bondOptions = useMemo(
    () => bonds.map((b) => ({ value: b.id, label: `${b.ticker} ${b.maturity}` })),
    [bonds]
  );

  const filtered = useMemo(
    () => (selectedBondId ? spreads.filter((s) => s.bondId === selectedBondId) : []),
    [spreads, selectedBondId]
  );

  const trace = useMemo(() => {
    if (filtered.length === 0) return [];
    return [
      {
        x: filtered.map((s) => s.curveDate),
        y: filtered.map((s) =>
          s.interpCurve1 != null && s.interpCurve2 != null
            ? s.interpCurve1 - s.interpCurve2
            : null
        ),
        name: "Curve 1 − Curve 2",
        type: "scatter" as const,
        mode: "lines" as const,
        fill: "tozeroy" as const,
        line: { color: "#61e3e8" },
        fillcolor: "rgba(97,227,232,0.1)",
      },
    ];
  }, [filtered]);

  if (bonds.length === 0) {
    return (
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          opacity: 0.5,
        }}
      >
        <IconChartAreaLine size={48} stroke={1.2} />
        <Text size="sm" mt="sm">
          Load data to view spread differences
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Select
        size="xs"
        placeholder="Select a bond"
        data={bondOptions}
        value={selectedBondId}
        onChange={(v) => setSelectedBondId(v)}
        mb="xs"
        w={250}
      />
      <Plot
        data={trace}
        layout={{
          title: { text: "Spread Difference (Curve 1 − Curve 2)" },
          xaxis: { title: { text: "Date" } },
          yaxis: { title: { text: "Δ Spread (bps)" } },
          margin: { t: 40, r: 20, b: 50, l: 60 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { family: "inherit" },
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: 300 }}
      />
    </Box>
  );
}
