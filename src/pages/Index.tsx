import { useCallback, useState } from "react";
import {
  ScatterChart,
  TrendingUp,
  AreaChart,
  Table2,
  Settings,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { loadBondUniverse, loadHistoricalSpreads } from "@/api/bloomberg";
import { MOCK_BONDS, MOCK_SPREADS } from "@/data/mockData";
import { BondTable } from "@/components/BondTable";
import { BqlModal } from "@/components/BqlModal";
import { CrossSectionPlot } from "@/components/CrossSectionPlot";
import { HistoricalChart1 } from "@/components/HistoricalChart1";
import { HistoricalChart2 } from "@/components/HistoricalChart2";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { useAppStore } from "@/store/useAppStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Index() {
  const [bqlOpen, setBqlOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("cross-section");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    settings,
    loading,
    error,
    setLoading,
    setError,
    setBonds,
    setSpreads,
  } = useAppStore();

  const handleLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [univRes, spreadRes] = await Promise.all([
        loadBondUniverse(settings),
        loadHistoricalSpreads(settings),
      ]);
      setBonds(univRes.bonds);
      setSpreads(spreadRes.spreads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [settings, setLoading, setError, setBonds, setSpreads]);

  const handleLoadDemo = useCallback(() => {
    setBonds(MOCK_BONDS);
    setSpreads(MOCK_SPREADS);
    setError(null);
  }, [setBonds, setSpreads, setError]);

  const scrollTo = (id: string) => {
    if (id === "settings") {
      setSettingsOpen(true);
      return;
    }
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader
        onLoad={handleLoad}
        onBqlOpen={() => setBqlOpen(true)}
        onLoadDemo={handleLoadDemo}
      />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          activeSection={activeSection}
          sidebarOpen={sidebarOpen}
          onNavigate={scrollTo}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-auto p-4">
          {error && (
            <Alert variant="destructive" className="mb-3">
              <AlertTriangle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-turquoise" />
            </div>
          )}

          <div className="space-y-4 max-w-[1400px]">
            {/* Cross Section */}
            <section id="cross-section" className="rounded-md border border-border bg-card shadow-sm">
              <div className="px-4 py-2 border-b border-border">
                <h2 className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                  <ScatterChart className="h-3.5 w-3.5 text-brand-vibrant" />
                  Cross-Section Analysis
                </h2>
              </div>
              <div className="p-3">
                <CrossSectionPlot />
              </div>
            </section>

            {/* Historical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section id="historical" className="rounded-md border border-border bg-card shadow-sm">
                <div className="px-4 py-2 border-b border-border">
                  <h2 className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-brand-green" />
                    Interpolated Spreads
                  </h2>
                </div>
                <div className="p-3">
                  <HistoricalChart1 />
                </div>
              </section>

              <section id="difference" className="rounded-md border border-border bg-card shadow-sm">
                <div className="px-4 py-2 border-b border-border">
                  <h2 className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                    <AreaChart className="h-3.5 w-3.5 text-brand-turquoise" />
                    Spread Difference
                  </h2>
                </div>
                <div className="p-3">
                  <HistoricalChart2 />
                </div>
              </section>
            </div>

            {/* Bond Table */}
            <section id="table" className="rounded-md border border-border bg-card shadow-sm">
              <div className="px-4 py-2 border-b border-border">
                <h2 className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                  <Table2 className="h-3.5 w-3.5 text-brand-orange" />
                  Bond Universe
                </h2>
              </div>
              <div className="p-3">
                <BondTable />
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <SettingsPanel />
        </DialogContent>
      </Dialog>

      <BqlModal open={bqlOpen} onOpenChange={setBqlOpen} />
    </div>
  );
}
