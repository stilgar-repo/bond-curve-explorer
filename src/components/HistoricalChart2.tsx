import { AreaChart } from "lucide-react";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useAppStore } from "@/store/useAppStore";
import { usePlotlyTheme } from "@/hooks/usePlotlyTheme";
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
  const plotTheme = usePlotlyTheme();

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
        line: { color: "#61e3e8", width: 1.5 },
        fillcolor: "rgba(97,227,232,0.08)",
      },
    ];
  }, [filtered]);

  if (bonds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
        <AreaChart className="h-10 w-10" strokeWidth={1} />
        <p className="text-xs mt-2">Load data to view spread differences</p>
      </div>
    );
  }

  return (
    <div>
      <Select value={selectedBondId ?? ""} onValueChange={(v) => setSelectedBondId(v || null)}>
        <SelectTrigger className="w-[220px] h-7 text-[11px] mb-2">
          <SelectValue placeholder="Select a bond" />
        </SelectTrigger>
        <SelectContent>
          {bondOptions.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Plot
        data={trace}
        layout={{
          ...plotTheme,
          xaxis: { ...plotTheme.xaxis, title: { text: "Date", font: { size: 10 } } },
          yaxis: { ...plotTheme.yaxis, title: { text: "Δ Spread (bps)", font: { size: 10 } } },
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: 280 }}
      />
    </div>
  );
}
