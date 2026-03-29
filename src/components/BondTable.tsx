import { Table2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { useMemo, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Bond, HistoricalSpread } from "@/types/bond";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type { ColDef, RowClickedEvent } from "ag-grid-community";

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
    return spreads.reduce(
      (max, s) => (s.curveDate > max ? s.curveDate : max),
      spreads[0].curveDate
    );
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
      return {
        ...b,
        spread: ls?.spread,
        interpBase: ls?.interpBase,
        interpCurve1: ls?.interpCurve1,
        interpCurve2: ls?.interpCurve2,
        yearsToMaturity: ls?.yearsToMaturity,
      };
    });
  }, [bonds, spreads, latestDate]);

  const columnDefs = useMemo<ColDef<TableRow>[]>(
    () => [
      { field: "ticker", headerName: "Ticker", flex: 1, minWidth: 100 },
      { field: "coupon", headerName: "Coupon", width: 90, valueFormatter: (p) => p.value?.toFixed(3) ?? "" },
      { field: "maturity", headerName: "Maturity", width: 110 },
      { field: "currency", headerName: "CCY", width: 70 },
      { field: "curve", headerName: "Curve", width: 80 },
      {
        field: "amountIssued",
        headerName: "Amt Issued",
        width: 130,
        valueFormatter: (p) => (p.value ? (p.value / 1e6).toFixed(0) + "M" : ""),
      },
      {
        field: "yearsToMaturity",
        headerName: "YTM",
        width: 80,
        valueFormatter: (p) => p.value?.toFixed(1) ?? "",
      },
      {
        field: "spread",
        headerName: "Spread",
        width: 90,
        valueFormatter: (p) => p.value?.toFixed(0) ?? "",
      },
      {
        field: "interpBase",
        headerName: "Base",
        width: 80,
        valueFormatter: (p) => p.value?.toFixed(0) ?? "",
      },
      {
        field: "interpCurve1",
        headerName: "Crv1",
        width: 80,
        valueFormatter: (p) => p.value?.toFixed(0) ?? "",
      },
      {
        field: "interpCurve2",
        headerName: "Crv2",
        width: 80,
        valueFormatter: (p) => p.value?.toFixed(0) ?? "",
      },
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
        return { background: "rgba(34,139,230,0.12)" };
      }
      return undefined;
    },
    [selectedBondId]
  );

  if (bonds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] opacity-50">
        <Table2 className="h-12 w-12" strokeWidth={1.2} />
        <p className="text-sm mt-3">Load data to view bond universe</p>
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
