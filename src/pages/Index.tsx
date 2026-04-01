import { useCallback, useEffect, useState } from "react";
import {
  Download,
  Code,
  Sun,
  Moon,
  AlertTriangle,
  Loader2,
  ScatterChart,
  TrendingUp,
  AreaChart,
  Table2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { checkHealth, loadBondUniverse, loadHistoricalSpreads } from "@/api/bloomberg";
import { BondTable } from "@/components/BondTable";
import { BqlModal } from "@/components/BqlModal";
import { CrossSectionPlot } from "@/components/CrossSectionPlot";
import { HistoricalChart1 } from "@/components/HistoricalChart1";
import { HistoricalChart2 } from "@/components/HistoricalChart2";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "cross-section", label: "Cross Section", icon: ScatterChart },
  { id: "historical", label: "Spreads", icon: TrendingUp },
  { id: "difference", label: "Spread Diff", icon: AreaChart },
  { id: "table", label: "Bond Table", icon: Table2 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Index() {
  const { theme, setTheme } = useTheme();
  const [bqlOpen, setBqlOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("cross-section");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    settings,
    loading,
    error,
    bloombergConnected,
    setLoading,
    setError,
    setBonds,
    setSpreads,
    setBloombergConnected,
  } = useAppStore();

  useEffect(() => {
    checkHealth()
      .then((res) => setBloombergConnected(res.bloomberg_connected))
      .catch(() => setBloombergConnected(false));
  }, [setBloombergConnected]);

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

  const isDark = theme === "dark";

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
      {/* Top Navbar */}
      <header className="h-12 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-foreground tracking-tight">
            Bond Spread Analyzer
          </h1>
          {bloombergConnected === false && (
            <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              Bloomberg not connected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleLoad} disabled={loading} className="h-8 text-xs">
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1.5" />
            )}
            Load Data
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBqlOpen(true)} className="h-8 text-xs">
            <Code className="h-3.5 w-3.5 mr-1.5" />
            BQL
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle color scheme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <nav
          className={cn(
            "shrink-0 border-r border-border bg-card flex flex-col transition-all duration-200",
            sidebarOpen ? "w-44" : "w-12"
          )}
        >
          <div className="flex-1 py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground font-medium border-l-2 border-primary"
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-brand-turquoise" />
            </div>
          )}

          <div className="space-y-6 max-w-[1400px]">
            {/* Cross Section */}
            <section id="cross-section" className="rounded-lg border border-border bg-card shadow-sm">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                  <ScatterChart className="h-4 w-4 text-brand-vibrant" />
                  Cross-Section Analysis
                </h2>
              </div>
              <div className="p-4">
                <CrossSectionPlot />
              </div>
            </section>

            {/* Historical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section id="historical" className="rounded-lg border border-border bg-card shadow-sm">
                <div className="px-5 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand-green" />
                    Interpolated Spreads
                  </h2>
                </div>
                <div className="p-4">
                  <HistoricalChart1 />
                </div>
              </section>

              <section id="difference" className="rounded-lg border border-border bg-card shadow-sm">
                <div className="px-5 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                    <AreaChart className="h-4 w-4 text-brand-turquoise" />
                    Spread Difference
                  </h2>
                </div>
                <div className="p-4">
                  <HistoricalChart2 />
                </div>
              </section>
            </div>

            {/* Bond Table */}
            <section id="table" className="rounded-lg border border-border bg-card shadow-sm">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-brand-orange" />
                  Bond Universe
                </h2>
              </div>
              <div className="p-4">
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
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <SettingsPanel />
        </DialogContent>
      </Dialog>

      {/* BQL Modal */}
      <BqlModal open={bqlOpen} onOpenChange={setBqlOpen} />
    </div>
  );
}
