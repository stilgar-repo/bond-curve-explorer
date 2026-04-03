import {
  ScatterChart,
  TrendingUp,
  AreaChart,
  Table2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "cross-section", label: "Cross Section", icon: ScatterChart },
  { id: "historical", label: "Spreads", icon: TrendingUp },
  { id: "difference", label: "Spread Diff", icon: AreaChart },
  { id: "table", label: "Bond Table", icon: Table2 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

interface AppSidebarProps {
  activeSection: string;
  sidebarOpen: boolean;
  onNavigate: (id: string) => void;
  onToggle: () => void;
}

export function AppSidebar({
  activeSection,
  sidebarOpen,
  onNavigate,
  onToggle,
}: AppSidebarProps) {
  return (
    <nav
      className={cn(
        "shrink-0 border-r border-border bg-card flex flex-col transition-all duration-200",
        sidebarOpen ? "w-40" : "w-11"
      )}
    >
      <div className="flex-1 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors",
                "hover:bg-accent/60 hover:text-accent-foreground",
                isActive &&
                  "bg-accent text-accent-foreground font-semibold border-l-2 border-brand-vibrant"
              )}
              title={item.label}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-8 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
    </nav>
  );
}
