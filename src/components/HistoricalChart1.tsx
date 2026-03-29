import { TrendingUp } from "lucide-react";
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
      { x: dates, y: filtered.map((s) => s.interpBase ?? null), name: "Base Curve", type: "scatter" as const, mode: "lines" as const, line: { color: "#001f87" } },
      { x: dates, y: filtered.map((s) => s.interpCurve1 ?? null), name: "Curve 1", type: "scatter" as const, mode: "lines" as const, line: { color: "#7fba50" } },
      { x: dates, y: filtered.map((s) => s.interpCurve2 ?? null), name: "Curve 2", type: "scatter" as const, mode: "lines" as const, line: { color: "#e86b00" } },
    ];
  }, [filtered]);

  if (bonds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] opacity-50">
        <TrendingUp className="h-12 w-12" strokeWidth={1.2} />
        <p className="text-sm mt-3">Load data to view historical spreads</p>
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
    </div>
  );
}
