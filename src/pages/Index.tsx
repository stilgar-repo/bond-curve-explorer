import { useEffect, useMemo } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { CrossSectionPlot } from "@/components/CrossSectionPlot";
import { HistoricalChart1 } from "@/components/HistoricalChart1";
import { HistoricalChart2 } from "@/components/HistoricalChart2";
import { BondTable } from "@/components/BondTable";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AppHeader } from "@/components/AppHeader";
import { useAppStore } from "@/store/useAppStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Index() {
  const { bonds, selectedBondId, loading, error, fontScale, highContrast } = useAppStore();

  // Apply font scale and high contrast to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("font-compact", "font-default", "font-large");
    root.classList.add(`font-${fontScale}`);

    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [fontScale, highContrast]);

  const selectedBond = useMemo(() => {
    if (!selectedBondId) return null;
    return bonds.find((b) => b.id === selectedBondId) ?? null;
  }, [bonds, selectedBondId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip navigation link — first focusable element */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      <AppHeader />

      <main id="main-content" className="flex-1 overflow-auto p-4" role="main">
        <div className="max-w-[1400px] mx-auto space-y-4">
          {/* Error banner */}
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription className="text-body">{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-6" role="status" aria-label="Loading data">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Loading bond data…</span>
            </div>
          )}

          {/* Inline configuration panel */}
          <SettingsPanel />

          {/* Summary metrics strip */}
          {bonds.length > 0 && (
            <div
              className="flex items-center gap-6 px-4 py-2 rounded-md border border-border bg-card"
              aria-live="polite"
              aria-label="Summary metrics"
            >
              <Metric label="Bonds" value={bonds.length.toString()} />
              <Metric label="Curves" value="3" />
              {selectedBond && (
                <>
                  <span className="text-border" aria-hidden="true">|</span>
                  <Metric
                    label="Selected"
                    value={`${selectedBond.ticker} ${selectedBond.maturity.slice(0, 4)}`}
                    highlight
                  />
                </>
              )}
            </div>
          )}

          {/* Cross-section scatter — full width */}
          <DashCard title="Cross-Section Analysis" subtitle="Spread vs maturity for latest date">
            <CrossSectionPlot />
          </DashCard>

          {/* Historical charts — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <DashCard title="Interpolated Spreads" subtitle="Time series of fitted curve values">
              <HistoricalChart1 />
            </DashCard>
            <DashCard title="Spread Difference" subtitle="Curve 1 − Curve 2 over time">
              <HistoricalChart2 />
            </DashCard>
          </div>

          {/* Bond table — full width */}
          <DashCard title="Bond Universe" subtitle="Click a row or press Enter to select. Arrow keys to navigate.">
            <BondTable />
          </DashCard>
        </div>
      </main>

      <footer className="h-[32px] flex items-center justify-center border-t border-border text-caption text-muted-foreground" role="contentinfo">
        Fixed Income Dashboard · Local Use Only
      </footer>
    </div>
  );
}

function DashCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-4" aria-label={title}>
      <div className="mb-3">
        <h3 className="text-h3 text-card-foreground">{title}</h3>
        {subtitle && <p className="text-caption text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-caption text-muted-foreground">{label}</span>
      {/* Accent yellow never used as text color — use primary with bold + accent border instead */}
      <span
        className={`text-body tabular-nums ${
          highlight
            ? "font-bold text-card-foreground border-b-2 border-accent"
            : "font-semibold text-card-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
