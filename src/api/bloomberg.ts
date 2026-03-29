import { API_BASE_URL } from "@/config/defaults";
import type {
  BondUniverseResponse,
  BqlSettings,
  HealthCheckResponse,
  HistoricalSpreadsResponse,
} from "@/types/bond";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Check Bloomberg terminal connectivity */
export function checkHealth(): Promise<HealthCheckResponse> {
  return apiFetch<HealthCheckResponse>("/health");
}

/** Load bond universe using current BQL settings */
export function loadBondUniverse(settings: BqlSettings): Promise<BondUniverseResponse> {
  return apiFetch<BondUniverseResponse>("/api/universe", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

/** Load historical spreads for the loaded universe */
export function loadHistoricalSpreads(settings: BqlSettings): Promise<HistoricalSpreadsResponse> {
  return apiFetch<HistoricalSpreadsResponse>("/api/spreads", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

/** Build the BQL query string for display purposes */
export function buildUniverseBql(settings: BqlSettings): string {
  const formatTickers = (raw: string): string =>
    raw
      .split(",")
      .map((t) => `"${t.trim()}"`)
      .join(",");

  const baseFilter = `TICKER in [${formatTickers(settings.baseCurve.tickers)}]`;
  const c1Filter = `TICKER in [${formatTickers(settings.curve1.tickers)}]`;
  const c2Filter = `TICKER in [${formatTickers(settings.curve2.tickers)}]`;

  const currFilter = [
    `(${baseFilter} AND CRNCY="${settings.baseCurve.currency}")`,
    `(${c1Filter} AND CRNCY="${settings.curve1.currency}")`,
    `(${c2Filter} AND CRNCY="${settings.curve2.currency}")`,
  ].join(" OR ");

  return [
    `let(#fields=[${settings.fieldList}];`,
    `#filter=(${currFilter})`,
    ` AND AMT_ISSUED>=${settings.minAmount}`,
    ` AND ISSUE_DT>=${settings.maxIssueDt};`,
    `#maxBonds=${settings.maxBonds})`,
    `get(#fields)`,
    `for(filter(bonds(#filter), count()<=maxBonds))`,
  ].join("\n");
}

export function buildSpreadsBql(settings: BqlSettings): string {
  return [
    `let(#lookback=range(${settings.lookbackWindow}, 0D);`,
    `#spreadType='${settings.spreadType}';`,
    `#localCcy='${settings.localCurrency}')`,
    `get(spread(spread_type=#spreadType, cross_currency=#localCcy))`,
    `for(#universe)`,
    `with(dates=#lookback)`,
  ].join("\n");
}
