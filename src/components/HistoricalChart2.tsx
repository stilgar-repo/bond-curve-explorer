import { AreaChart } from "lucide-react";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <div className="flex flex-col items-center justify-center h-[300px] opacity-50">
        <AreaChart className="h-12 w-12" strokeWidth={1.2} />
        <p className="text-sm mt-3">Load data to view spread differences</p>
      </div>
    );
  }

  return (
    <div>
      <Select value={selectedBondId ?? ""} onValueChange={(v) => setSelectedBondId(v || null)}>
        <SelectTrigger className="w-[250px] h-8 text-sm mb-2">
          <SelectValue placeholder="Select a bond" />
        </SelectTrigger>
        <SelectContent>
          {bondOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    </div>
  );
}
