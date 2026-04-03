import { useCallback } from "react";
import { Sun, Moon, Database, PlayCircle, Loader2, Contrast } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAppStore, type FontScale } from "@/store/useAppStore";
import { loadBondUniverse, loadHistoricalSpreads } from "@/api/bloomberg";
import { MOCK_BONDS, MOCK_SPREADS } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const FONT_SCALES: { label: string; value: FontScale }[] = [
  { label: "A−", value: "compact" },
  { label: "A", value: "default" },
  { label: "A+", value: "large" },
];

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const {
    settings, loading, fontScale, highContrast,
    setLoading, setError, setBonds, setSpreads, setFontScale, setHighContrast,
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

  return (
    <TooltipProvider delayDuration={200}>
      <header
        className="h-[48px] flex items-center justify-between px-4 bg-primary text-primary-foreground border-b border-border"
        role="banner"
      >
        <h1 className="text-body font-semibold tracking-tight">
          Fixed Income Dashboard
        </h1>

        <div className="flex items-center gap-1">
          {/* Font scaling controls */}
          <div
            className="flex items-center border border-primary-foreground/30 rounded-sm mr-2"
            role="group"
            aria-label="Font size"
          >
            {FONT_SCALES.map(({ label, value }) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setFontScale(value)}
                    aria-label={`Font size: ${value}`}
                    aria-pressed={fontScale === value}
                    className={`px-2 py-1 text-caption transition-colors ${
                      fontScale === value
                        ? "bg-primary-foreground text-primary font-bold"
                        : "text-primary-foreground hover:bg-primary-foreground/20"
                    }`}
                  >
                    {label}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{value.charAt(0).toUpperCase() + value.slice(1)} text size</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadDemo}
                className="h-[36px] text-caption text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Demo
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load sample bond data for testing</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoad}
                disabled={loading}
                className="h-[36px] text-caption text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-1" />
                )}
                Load
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fetch bond universe and spreads from Bloomberg</TooltipContent>
          </Tooltip>

          {/* High contrast toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHighContrast(!highContrast)}
                aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
                aria-pressed={highContrast}
                className={`h-[36px] w-[36px] p-0 text-primary-foreground hover:bg-secondary hover:text-secondary-foreground ${
                  highContrast ? "bg-primary-foreground/20" : ""
                }`}
              >
                <Contrast className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {highContrast ? "Disable" : "Enable"} high contrast mode
            </TooltipContent>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                className="h-[36px] w-[36px] p-0 text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch to {theme === "light" ? "dark" : "light"} mode</TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
