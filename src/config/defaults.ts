import type { BqlSettings } from "@/types/bond";

export const DEFAULT_BQL_SETTINGS: BqlSettings = {
  fieldList: "ticker, cpn, issue_dt, maturity, amt_issued",
  maxBonds: 10,
  minAmount: "1000000000",
  maxIssueDt: "-1Y",
  baseCurve: {
    tickers: "IBRD",
    currency: "USD",
  },
  curve1: {
    tickers: "ONT,Q",
    currency: "CAD",
  },
  curve2: {
    tickers: "PSPCAP",
    currency: "CAD",
  },
  lookbackWindow: "1M",
  spreadType: "ASW",
  localCurrency: "USD",
};

export const API_BASE_URL = "http://localhost:8000";
