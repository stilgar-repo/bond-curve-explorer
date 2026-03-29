/** A single bond from the BondUniverse query */
export interface Bond {
  id: string;
  ticker: string;
  coupon: number;
  issueDate: string;
  maturity: string;
  amountIssued: number;
  currency: string;
  curve: "base" | "curve1" | "curve2";
}

/** A single row of historical spread data */
export interface HistoricalSpread {
  bondId: string;
  curveDate: string;
  spread: number;
  yearsToMaturity: number;
  /** Fitted parameters for interpolation */
  interpBase?: number;
  interpCurve1?: number;
  interpCurve2?: number;
}

/** Curve configuration for a single curve */
export interface CurveConfig {
  tickers: string;
  currency: string;
}

/** Full BQL settings */
export interface BqlSettings {
  fieldList: string;
  maxBonds: number;
  minAmount: string;
  maxIssueDt: string;
  baseCurve: CurveConfig;
  curve1: CurveConfig;
  curve2: CurveConfig;
  lookbackWindow: string;
  spreadType: string;
  localCurrency: string;
}

/** API response shapes */
export interface BondUniverseResponse {
  bonds: Bond[];
}

export interface HistoricalSpreadsResponse {
  spreads: HistoricalSpread[];
}

export interface HealthCheckResponse {
  bloomberg_connected: boolean;
  message: string;
}

/** Supported local currencies */
export type LocalCurrency = "USD" | "CAD" | "EUR" | "GBP" | "AUD";

export const LOCAL_CURRENCIES: LocalCurrency[] = ["USD", "CAD", "EUR", "GBP", "AUD"];
