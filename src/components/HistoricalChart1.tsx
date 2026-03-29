import { Box, Select, Text } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";

/** Historical interpolated spreads for base, curve1, curve2 */
export function HistoricalChart1() {
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

  const traces = useMemo(() => {
    if (filtered.length === 0) return [];
    const dates = filtered.map((s) => s.curveDate);
    return [
      {
        x: dates,
        y: filtered.map((s) => s.interpBase ?? null),
        name: "Base Curve",
        type: "scatter" as const,
        mode: "lines" as const,
        line: { color: "#228be6" },
      },
      {
        x: dates,
        y: filtered.map((s) => s.interpCurve1 ?? null),
        name: "Curve 1",
        type: "scatter" as const,
        mode: "lines" as const,
        line: { color: "#40c057" },
      },
      {
        x: dates,
        y: filtered.map((s) => s.interpCurve2 ?? null),
        name: "Curve 2",
        type: "scatter" as const,
        mode: "lines" as const,
        line: { color: "#fa5252" },
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
        <IconChartLine size={48} stroke={1.2} />
        <Text size="sm" mt="sm">
          Load data to view historical spreads
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
        data={traces}
        layout={{
          title: { text: "Interpolated Spreads" },
          xaxis: { title: { text: "Date" } },
          yaxis: { title: { text: "Spread (bps)" } },
          margin: { t: 40, r: 20, b: 50, l: 60 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { family: "inherit" },
          legend: { orientation: "h", y: -0.25 },
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: 300 }}
      />
    </Box>
  );
}
