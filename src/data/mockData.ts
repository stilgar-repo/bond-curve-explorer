import type { Bond, HistoricalSpread } from "@/types/bond";

/** Generate realistic mock bonds */
export const MOCK_BONDS: Bond[] = [
  { id: "IBRD-2028", ticker: "IBRD", coupon: 3.125, issueDate: "2023-03-15", maturity: "2028-03-15", amountIssued: 5000000000, currency: "USD", curve: "base" },
  { id: "IBRD-2030", ticker: "IBRD", coupon: 3.5, issueDate: "2023-06-01", maturity: "2030-06-01", amountIssued: 4000000000, currency: "USD", curve: "base" },
  { id: "IBRD-2033", ticker: "IBRD", coupon: 3.75, issueDate: "2023-09-10", maturity: "2033-09-10", amountIssued: 3500000000, currency: "USD", curve: "base" },
  { id: "IBRD-2035", ticker: "IBRD", coupon: 4.0, issueDate: "2024-01-20", maturity: "2035-01-20", amountIssued: 3000000000, currency: "USD", curve: "base" },
  { id: "ONT-2027", ticker: "ONT", coupon: 2.85, issueDate: "2022-11-01", maturity: "2027-11-01", amountIssued: 2500000000, currency: "CAD", curve: "curve1" },
  { id: "ONT-2029", ticker: "ONT", coupon: 3.25, issueDate: "2023-04-15", maturity: "2029-04-15", amountIssued: 2000000000, currency: "CAD", curve: "curve1" },
  { id: "ONT-2032", ticker: "ONT", coupon: 3.6, issueDate: "2023-08-01", maturity: "2032-08-01", amountIssued: 1800000000, currency: "CAD", curve: "curve1" },
  { id: "PSPCAP-2028", ticker: "PSPCAP", coupon: 3.0, issueDate: "2023-02-10", maturity: "2028-02-10", amountIssued: 1500000000, currency: "CAD", curve: "curve2" },
  { id: "PSPCAP-2031", ticker: "PSPCAP", coupon: 3.45, issueDate: "2023-07-20", maturity: "2031-07-20", amountIssued: 1200000000, currency: "CAD", curve: "curve2" },
  { id: "PSPCAP-2034", ticker: "PSPCAP", coupon: 3.9, issueDate: "2024-03-05", maturity: "2034-03-05", amountIssued: 1000000000, currency: "CAD", curve: "curve2" },
];

function yearsBetween(d1: string, d2: string): number {
  return (new Date(d2).getTime() - new Date(d1).getTime()) / (365.25 * 86400000);
}

/** Generate time-series spread data for each bond over 30 business days */
function generateSpreads(): HistoricalSpread[] {
  const result: HistoricalSpread[] = [];
  const today = new Date("2026-04-03");

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const dateStr = d.toISOString().slice(0, 10);

    for (const bond of MOCK_BONDS) {
      const ytm = yearsBetween(dateStr, bond.maturity);
      if (ytm <= 0) continue;

      // Simulate a spread curve: base ≈ 20-60bps, curve1 ≈ 40-90bps, curve2 ≈ 60-120bps
      const noise = Math.sin(dayOffset * 0.5 + bond.coupon * 3) * 5;
      const baseLevel = bond.curve === "base" ? 25 : bond.curve === "curve1" ? 55 : 80;
      const spread = baseLevel + ytm * 4 + noise;

      // Interpolated values (simulated NSS fit)
      const interpBase = 20 + ytm * 3.5 + Math.sin(dayOffset * 0.3) * 2;
      const interpCurve1 = 45 + ytm * 4.2 + Math.cos(dayOffset * 0.4) * 3;
      const interpCurve2 = 70 + ytm * 5.0 + Math.sin(dayOffset * 0.2) * 4;

      result.push({
        bondId: bond.id,
        curveDate: dateStr,
        spread: Math.round(spread * 10) / 10,
        yearsToMaturity: Math.round(ytm * 100) / 100,
        interpBase: Math.round(interpBase * 10) / 10,
        interpCurve1: Math.round(interpCurve1 * 10) / 10,
        interpCurve2: Math.round(interpCurve2 * 10) / 10,
      });
    }
  }
  return result;
}

export const MOCK_SPREADS: HistoricalSpread[] = generateSpreads();
