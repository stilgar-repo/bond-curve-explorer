import { useCallback, useEffect } from "react";
import { Download, Code, Sun, Moon, AlertTriangle, Loader2 } from "lucide-react";

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
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useState } from "react";

export default function Index() {
  const { theme, setTheme } = useTheme();
  const [bqlOpen, setBqlOpen] = useState(false);

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarContent className="p-4">
            <SettingsPanel />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b border-border bg-accent px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-lg font-bold text-foreground">
                Bond Spread Analyzer
              </h1>
              {bloombergConnected === false && (
                <Alert variant="destructive" className="inline-flex py-1 px-3 h-auto">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Bloomberg not connected
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleLoad} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Load
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBqlOpen(true)}>
                <Code className="h-4 w-4 mr-2" />
                BQL
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle color scheme"
              >
                {isDark ? <Sun className="h-4 w-4 text-brand-highlight" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 overflow-auto">
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

            <div className="grid gap-4">
              {/* Cross section */}
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <CrossSectionPlot />
              </div>

              {/* Historical charts side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <HistoricalChart1 />
                </div>
                <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <HistoricalChart2 />
                </div>
              </div>

              {/* Bond table */}
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <h2 className="font-semibold mb-2 text-card-foreground">Bond Universe</h2>
                <BondTable />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* BQL Modal */}
      <BqlModal open={bqlOpen} onOpenChange={setBqlOpen} />
    </SidebarProvider>
  );
}
