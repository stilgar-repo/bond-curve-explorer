import {
  Download,
  Code,
  Sun,
  Moon,
  AlertTriangle,
  Loader2,
  Database,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onLoad: () => void;
  onBqlOpen: () => void;
  onLoadDemo: () => void;
}

export function AppHeader({ onLoad, onBqlOpen, onLoadDemo }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const loading = useAppStore((s) => s.loading);
  const bloombergConnected = useAppStore((s) => s.bloombergConnected);
  const isDark = theme === "dark";

  return (
    <header className="h-11 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-foreground tracking-tight uppercase">
          Bond Spread Analyzer
        </h1>
        {bloombergConnected === false && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-destructive font-medium">
            <AlertTriangle className="h-3 w-3" />
            Bloomberg offline
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={onLoadDemo}
          className="h-7 text-[11px] px-2.5"
        >
          <Database className="h-3 w-3 mr-1" />
          Demo
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onLoad}
          disabled={loading}
          className="h-7 text-[11px] px-2.5"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Download className="h-3 w-3 mr-1" />
          )}
          Load
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onBqlOpen}
          className="h-7 text-[11px] px-2.5"
        >
          <Code className="h-3 w-3 mr-1" />
          BQL
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle color scheme"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </header>
  );
}
