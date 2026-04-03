import { AgGridReact } from "ag-grid-react";
import { useMemo, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Bond, HistoricalSpread } from "@/types/bond";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type { ColDef, RowClickedEvent } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

interface TableRow extends Bond {
  spread?: number;
  interpBase?: number;
  interpCurve1?: number;
  interpCurve2?: number;
  yearsToMaturity?: number;
}

export function BondTable() {
  const bonds = useAppStore((s) => s.bonds);
  const spreads = useAppStore((s) => s.spreads);
  const selectedBondId = useAppStore((s) => s.selectedBondId);
  const setSelectedBondId = useAppStore((s) => s.setSelectedBondId);

  const latestDate = useMemo(() => {
    if (spreads.length === 0) return null;
    return spreads.reduce((max, s) => (s.curveDate > max ? s.curveDate : max), spreads[0].curveDate);
  }, [spreads]);

  const rowData = useMemo<TableRow[]>(() => {
    const latestMap = new Map<string, HistoricalSpread>();
    if (latestDate) {
      for (const s of spreads) {
        if (s.curveDate === latestDate) latestMap.set(s.bondId, s);
      }
    }
    return bonds.map((b) => {
      const ls = latestMap.get(b.id);
      return { ...b, spread: ls?.spread, interpBase: ls?.interpBase, interpCurve1: ls?.interpCurve1, interpCurve2: ls?.interpCurve2, yearsToMaturity: ls?.yearsToMaturity };
    });
  }, [bonds, spreads, latestDate]);

  const columnDefs = useMemo<ColDef<TableRow>[]>(
    () => [
      { field: "ticker", headerName: "Ticker", flex: 1, minWidth: 90, pinned: "left" },
      { field: "coupon", headerName: "Coupon", width: 85, valueFormatter: (p) => p.value != null ? p.value.toFixed(3) + "%" : "", cellClass: "tabular-nums text-right" },
      { field: "maturity", headerName: "Maturity", width: 110 },
      { field: "currency", headerName: "CCY", width: 60 },
      { field: "curve", headerName: "Curve", width: 75 },
      { field: "amountIssued", headerName: "Amt Issued", width: 110, valueFormatter: (p) => p.value ? (p.value / 1e6).toFixed(0) + "M" : "", cellClass: "tabular-nums text-right" },
      { field: "yearsToMaturity", headerName: "YTM", width: 70, valueFormatter: (p) => p.value?.toFixed(1) ?? "", cellClass: "tabular-nums text-right" },
      { field: "spread", headerName: "Spread", width: 80, valueFormatter: (p) => p.value != null ? p.value.toFixed(0) + " bps" : "", cellClass: "tabular-nums text-right" },
      { field: "interpBase", headerName: "Base", width: 70, valueFormatter: (p) => p.value?.toFixed(0) ?? "", cellClass: "tabular-nums text-right" },
      { field: "interpCurve1", headerName: "Crv1", width: 70, valueFormatter: (p) => p.value?.toFixed(0) ?? "", cellClass: "tabular-nums text-right" },
      { field: "interpCurve2", headerName: "Crv2", width: 70, valueFormatter: (p) => p.value?.toFixed(0) ?? "", cellClass: "tabular-nums text-right" },
    ],
    []
  );

  const onRowClicked = useCallback(
    (e: RowClickedEvent<TableRow>) => {
      if (e.data?.id) setSelectedBondId(e.data.id);
    },
    [setSelectedBondId]
  );

  const getRowStyle = useCallback(
    (params: { data?: TableRow }) => {
      if (params.data?.id === selectedBondId) {
        return {
          borderLeft: "3px solid hsl(66 100% 50%)",
          background: "hsla(66 100% 50% / 0.06)",
        };
      }
      return undefined;
    },
    [selectedBondId]
  );

  if (bonds.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p className="text-caption">Load data to view bond universe</p>
      </div>
    );
  }

  return (
    <div className="ag-theme-alpine h-[350px] w-full">
      <AgGridReact<TableRow>
        rowData={rowData}
        columnDefs={columnDefs}
        onRowClicked={onRowClicked}
        getRowStyle={getRowStyle}
        rowSelection="single"
        animateRows
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
      />
    </div>
  );
}
